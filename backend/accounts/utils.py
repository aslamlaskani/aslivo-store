import json
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import OTPVerification


# ─── OTP CREATION ────────────────────────────────────────────────

def create_otp(otp_type, email=None, phone=None, user=None, expires_minutes=10):
    qs = OTPVerification.objects.filter(otp_type=otp_type, is_used=False)
    if email: qs = qs.filter(email=email)
    if phone: qs = qs.filter(phone=phone)
    qs.update(is_used=True)

    return OTPVerification.objects.create(
        user=user, email=email, phone=phone,
        otp=OTPVerification.generate_otp(),
        otp_type=otp_type,
        expires_at=timezone.now() + timedelta(minutes=expires_minutes),
    )


def verify_otp(otp_code, otp_type, email=None, phone=None, user=None):
    """
    Always filter by (otp + type + user_id) when user is known.
    This prevents concurrent resets from leaking OTPs across users.
    Falls back to email/phone filter only when user is not yet known.
    """
    qs = OTPVerification.objects.filter(
        otp=otp_code, otp_type=otp_type,
        is_used=False, expires_at__gt=timezone.now(),
    )

    if user:
        # Tightest filter — user_id is unique, no ambiguity
        qs = qs.filter(user=user)
    else:
        if email: qs = qs.filter(email=email)
        if phone: qs = qs.filter(phone=phone)

    record = qs.first()
    if record:
        record.is_used = True
        record.save()
        return record
    return None


# ─── PHONE FORMATTING ────────────────────────────────────────────

def format_phone(phone):
    """Normalize to E.164 (+92 Pakistan default)."""
    phone = str(phone).strip().replace(' ', '').replace('-', '')
    if phone.startswith('0'):
        return '+92' + phone[1:]
    if not phone.startswith('+'):
        return '+92' + phone
    return phone


# ─── EMAIL OTP ───────────────────────────────────────────────────

def send_otp_email(email, otp_code, subject, purpose_text):
    message = (
        f"Assalam o Alaikum!\n\n"
        f"Your {purpose_text} code for Aslivo Store is:\n\n"
        f"  ━━━━━━━━━━━━━━━\n"
        f"       {otp_code}\n"
        f"  ━━━━━━━━━━━━━━━\n\n"
        f"This code expires in 10 minutes.\n"
        f"Do not share it with anyone.\n\n"
        f"— Aslivo Store Team"
    )
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f'[Email OTP Error] {e}')
        return False


def send_registration_otp_email(email, otp_code):
    return send_otp_email(
        email, otp_code,
        subject='Your Aslivo Store Verification Code',
        purpose_text='email verification',
    )


def send_password_reset_otp_email(email, otp_code):
    return send_otp_email(
        email, otp_code,
        subject='Aslivo Store — Password Reset Code',
        purpose_text='password reset',
    )



def _twilio_configured():
    return bool(
        getattr(settings, 'TWILIO_ACCOUNT_SID',  None) and
        getattr(settings, 'TWILIO_AUTH_TOKEN',    None) and
        getattr(settings, 'TWILIO_WHATSAPP_FROM', None) and
        getattr(settings, 'TWILIO_CONTENT_SID',   None) and
        settings.TWILIO_ACCOUNT_SID != 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' and
        settings.TWILIO_AUTH_TOKEN  != 'your_auth_token_here'
    )


def send_whatsapp_otp(phone, otp_code, purpose_text):
    """
    Send OTP via Twilio WhatsApp using content_sid template.
    Falls back to printing OTP in console if Twilio not configured.
    """
    phone_e164 = format_phone(phone)

    if _twilio_configured():
        try:
            from twilio.rest import Client
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

            client.messages.create(
                from_=f'whatsapp:{settings.TWILIO_WHATSAPP_FROM}',
                content_sid=settings.TWILIO_CONTENT_SID,
                content_variables=json.dumps({"1": str(otp_code)}),
                to=f'whatsapp:{phone_e164}',
            )
            print(f'[WhatsApp OTP] Sent to {phone_e164} — code {otp_code}')
            return True

        except ImportError:
            print('[WhatsApp OTP] twilio not installed. Run: pip install twilio')
        except Exception as e:
            print(f'[WhatsApp OTP Error] {e}')
            # Try plain body as fallback (works for some Twilio configs)
            try:
                from twilio.rest import Client
                client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                client.messages.create(
                    from_=f'whatsapp:{settings.TWILIO_WHATSAPP_FROM}',
                    body=(
                        f"*Aslivo Store* 🛍️\n\n"
                        f"Your {purpose_text} code is:\n\n"
                        f"*{otp_code}*\n\n"
                        f"Valid for 10 minutes."
                    ),
                    to=f'whatsapp:{phone_e164}',
                )
                return True
            except Exception as e2:
                print(f'[WhatsApp OTP Fallback Error] {e2}')

    # Dev mode — print to console
    print('\n' + '=' * 50)
    print(f'  📱 WHATSAPP OTP — {purpose_text.upper()}')
    print(f'  To    : {phone_e164}')
    print(f'  Code  : {otp_code}')
    print('  (Twilio not configured — dev mode)')
    print('=' * 50 + '\n')
    return True   # always True so API flow continues


def send_registration_otp_whatsapp(phone, otp_code):
    return send_whatsapp_otp(phone, otp_code, 'registration verification')


def send_password_reset_otp_whatsapp(phone, otp_code):
    return send_whatsapp_otp(phone, otp_code, 'password reset')