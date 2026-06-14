from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from django.conf import settings
from django.contrib.auth import authenticate

from .models import User, Address, OTPVerification
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    ChangePasswordSerializer, UpdateProfileSerializer, AddressSerializer,
    EmailTokenObtainPairSerializer,
    SendEmailOTPSerializer, VerifyEmailOTPSerializer,
    SendWhatsAppOTPSerializer, VerifyWhatsAppOTPSerializer,
    ForgotPasswordEmailSerializer, ResetPasswordEmailSerializer,
    ForgotPasswordPhoneSerializer, ResetPasswordPhoneSerializer,
    GoogleAuthSerializer,
)
from .utils import (
    create_otp, verify_otp,
    send_registration_otp_email, send_password_reset_otp_email,
    send_registration_otp_whatsapp, send_password_reset_otp_whatsapp,
    format_phone,
)


# ─── HELPERS ─────────────────────────────────────────────────────

def _tokens(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


def _user_data(user):
    data = UserSerializer(user).data
    data['is_staff']     = user.is_staff
    data['is_superuser'] = user.is_superuser
    return data


# ─── JWT ─────────────────────────────────────────────────────────

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


# ═══════════════════════════════════════════════════════════════
# STANDARD REGISTER / LOGIN / LOGOUT
# ═══════════════════════════════════════════════════════════════

class RegisterView(generics.CreateAPIView):
    """
    Register a new user and immediately send an email OTP for verification.
    Returns tokens so the user can start browsing, but is_email_verified=False
    until they confirm the OTP.
    """
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Send verification OTP
        otp_record = create_otp('email_register', email=user.email, user=user)
        send_registration_otp_email(user.email, otp_record.otp)

        return Response({
            'message': 'Account created. Check your email for a verification code.',
            'user':    _user_data(user),
            'tokens':  _tokens(user),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.get_response(), status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                RefreshToken(refresh_token).blacklist()
        except Exception:
            pass
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)


# ═══════════════════════════════════════════════════════════════
# PROFILE / PASSWORD
# ═══════════════════════════════════════════════════════════════

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(_user_data(request.user))

    def put(self, request):
        serializer = UpdateProfileSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'message': 'Profile updated',
            'user':    _user_data(request.user),
        })


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Password changed successfully'})


# ═══════════════════════════════════════════════════════════════
# EMAIL OTP — REGISTRATION VERIFICATION
# ═══════════════════════════════════════════════════════════════

class SendEmailOTPView(APIView):
    """Send (or resend) a registration verification OTP to the email."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SendEmailOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        user = User.objects.filter(email=email).first()
        otp_record = create_otp('email_register', email=email, user=user)
        sent = send_registration_otp_email(email, otp_record.otp)

        if not sent:
            return Response(
                {'error': 'Failed to send OTP. Try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        return Response({'message': f'OTP sent to {email}'})


class VerifyEmailOTPView(APIView):
    """Verify the email OTP sent on registration."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyEmailOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        otp   = serializer.validated_data['otp']

        record = verify_otp(otp, 'email_register', email=email)
        if not record:
            return Response(
                {'error': 'Invalid or expired OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email=email).first()
        if user:
            user.is_email_verified = True
            user.save()

        return Response({'message': 'Email verified successfully ✅'})


# ═══════════════════════════════════════════════════════════════
# EMAIL OTP — FORGOT / RESET PASSWORD
# ═══════════════════════════════════════════════════════════════

class ForgotPasswordEmailView(APIView):
    """Send a password-reset OTP to the user's email."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        user       = User.objects.get(email=email)
        otp_record = create_otp('email_reset', email=email, user=user)
        sent       = send_password_reset_otp_email(email, otp_record.otp)

        if not sent:
            return Response(
                {'error': 'Failed to send reset email. Try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        return Response({'message': f'Password reset code sent to {email}'})


class ResetPasswordEmailView(APIView):
    """Verify OTP and set a new password."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        record = verify_otp(data['otp'], 'email_reset', email=data['email'])
        if not record:
            return Response(
                {'error': 'Invalid or expired OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email=data['email']).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        user.set_password(data['new_password'])
        user.save()

        return Response({
            'message': 'Password reset successfully. You can now log in.',
            'tokens':  _tokens(user),
        })


# ═══════════════════════════════════════════════════════════════
# WHATSAPP OTP — REGISTRATION
# ═══════════════════════════════════════════════════════════════

class SendWhatsAppOTPView(APIView):
    """Send a registration OTP via WhatsApp."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SendWhatsAppOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        raw_phone = serializer.validated_data['phone'].strip()
        formatted = format_phone(raw_phone)

        # Find user if exists (optional — OTP can be sent without a user)
        user = (
            User.objects.filter(phone=raw_phone).first() or
            User.objects.filter(phone=formatted).first()
        )

        otp_record = create_otp('whatsapp_register', phone=raw_phone, user=user)
        sent = send_registration_otp_whatsapp(formatted, otp_record.otp)

        if not sent:
            return Response(
                {'error': 'Failed to send WhatsApp OTP. Check the number and try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        return Response({'message': f'OTP sent to WhatsApp {raw_phone}'})


class VerifyWhatsAppOTPView(APIView):
    """Verify WhatsApp OTP for registration."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyWhatsAppOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        raw_phone = serializer.validated_data['phone'].strip()
        formatted = format_phone(raw_phone)
        otp = serializer.validated_data['otp']

        # Try OTP with both formats
        record = (
            verify_otp(otp, 'whatsapp_register', phone=raw_phone) or
            verify_otp(otp, 'whatsapp_register', phone=formatted)
        )
        if not record:
            return Response(
                {'error': 'Invalid or expired OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find and mark user verified
        user = (
            User.objects.filter(phone=raw_phone).first() or
            User.objects.filter(phone=formatted).first()
        )
        if user:
            user.is_email_verified = True
            user.save()

        return Response({'message': 'Phone verified successfully ✅'})


# ═══════════════════════════════════════════════════════════════
# WHATSAPP OTP — FORGOT / RESET PASSWORD
# ═══════════════════════════════════════════════════════════════

class ForgotPasswordPhoneView(APIView):
    """Send password-reset OTP via WhatsApp."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw_phone = request.data.get('phone', '').strip()
        if not raw_phone:
            return Response({'error': 'Phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Try to find user with original phone OR formatted phone
        formatted = format_phone(raw_phone)
        user = (
            User.objects.filter(phone=raw_phone).first() or
            User.objects.filter(phone=formatted).first() or
            User.objects.filter(phone=raw_phone.replace('+92', '0')).first()
        )

        if not user:
            return Response(
                {'error': 'No account found with this phone number.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Use the phone as stored in DB for OTP lookup consistency
        otp_phone = user.phone
        otp_record = create_otp('whatsapp_reset', phone=otp_phone, user=user)
        # Send to formatted number (Twilio needs +92...)
        sent = send_password_reset_otp_whatsapp(format_phone(otp_phone), otp_record.otp)

        if not sent:
            return Response(
                {'error': 'Failed to send WhatsApp message. Check the number and try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        return Response({'message': f'Reset code sent to WhatsApp {otp_phone}'})


class ResetPasswordPhoneView(APIView):
    """Verify WhatsApp OTP and reset password."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordPhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data      = serializer.validated_data
        raw_phone = data['phone'].strip()

        # Find user by any phone format
        formatted = format_phone(raw_phone)
        user = (
            User.objects.filter(phone=raw_phone).first() or
            User.objects.filter(phone=formatted).first() or
            User.objects.filter(phone=raw_phone.replace('+92', '0')).first()
        )
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Try OTP match against stored phone (how it was saved in create_otp)
        record = (
            verify_otp(data['otp'], 'whatsapp_reset', phone=user.phone) or
            verify_otp(data['otp'], 'whatsapp_reset', phone=formatted)  or
            verify_otp(data['otp'], 'whatsapp_reset', phone=raw_phone)
        )
        if not record:
            return Response(
                {'error': 'Invalid or expired OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(data['new_password'])
        user.save()

        return Response({
            'message': 'Password reset successfully.',
            'tokens':  _tokens(user),
        })


# ═══════════════════════════════════════════════════════════════
# GOOGLE OAUTH
# ═══════════════════════════════════════════════════════════════

class GoogleLoginView(APIView):
    """
    Receive Google ID token from frontend (after Google sign-in),
    verify it, and return JWT tokens.
    Creates user if first time, logs in if existing.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data['id_token']

        try:
            # Verify the token with Google
            idinfo = google_id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError as e:
            return Response(
                {'error': f'Invalid Google token: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        google_id = idinfo['sub']
        email     = idinfo.get('email', '')
        first     = idinfo.get('given_name', '')
        last      = idinfo.get('family_name', '')
        avatar    = idinfo.get('picture', '')

        # Try to find existing user
        user = User.objects.filter(google_id=google_id).first()

        if not user:
            # Try by email (user may have registered manually before)
            user = User.objects.filter(email=email).first()
            if user:
                user.google_id  = google_id
                user.avatar_url = avatar
                user.save()
            else:
                # Create new user
                user = User.objects.create_user(
                    email=email,
                    first_name=first,
                    last_name=last or '.',
                    password=None,
                )
                user.google_id        = google_id
                user.avatar_url       = avatar
                user.is_email_verified = True   # Google already verified the email
                user.save()

        if not user.is_active:
            return Response(
                {'error': 'Account is disabled'},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response({
            'message': 'Google login successful',
            'user':    _user_data(user),
            'tokens':  _tokens(user),
        })


# ═══════════════════════════════════════════════════════════════
# ADDRESSES
# ═══════════════════════════════════════════════════════════════

class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class   = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        self.get_object().delete()
        return Response({'message': 'Address deleted'}, status=status.HTTP_200_OK)