
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-csnx)ybze63ansp+r3zddd)&k3xphabwl$u!s%xusp502q^=-^'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'advisor',
    'rest_framework',         # DRF
    'django_filters',         # django-filter
    'corsheaders',            # django-cors-headers
    'django_extensions',
    'rest_framework_simplejwt',
    'captcha',"graph","chatbot","recommendations",
    
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',

]

ROOT_URLCONF = 'portopt.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'portopt.wsgi.application'
# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'invest',
        'USER' : 'postgres',
        'PASSWORD' : 'maissa30',
        'HOST' : 'localhost',
        'PORT' : 5432,
    }
}
# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'advisor.User'   # Points Django to my custom user model

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        #'rest_framework_simplejwt.authentication.JWTAuthentication',
        'advisor.authentication.CookieJWTAuthentication',
    ],
}
#CORS_ALLOW_ALL_ORIGINS = True
# For production, specify allowed origins
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # Your React frontend
    'http://127.0.0.1:3000',
]
CORS_ALLOW_CREDENTIALS = True
'''
from datetime import timedelta
SIMPLE_JWT = {
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.SlidingToken',),
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=10),        # 5 min "active" window
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),   # max total life = 1 day
   
}
'''


STATIC_URL = '/static/'

CAPTCHA_IMAGE_SIZE = (300, 100)  # Ensures a proper size
CAPTCHA_FONT_SIZE = 20  # Adjust font size if needed
CAPTCHA_LENGTH = 6  # Default text length
CAPTCHA_TIMEOUT = 300  # 5 minutes instead of default 2
CAPTCHA_NOISE_FUNCTIONS = (
    'captcha.helpers.noise_dots',
    'captcha.helpers.noise_arcs',
)

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
# Media Configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
STATIC_URL = '/static/'  # The URL for static files (CSS, JS, etc.)
STATIC_ROOT = BASE_DIR / 'static'


RECAPTCHA_PUBLIC_KEY = '6LfPsc0qAAAAAC0U-uag9eVNSQQ4xSJP6GZ4pwKM'
RECAPTCHA_PRIVATE_KEY = '6LfPsc0qAAAAAFdFnzGuO7REGXpzY0XyWsGiSU8G'

CSRF_TRUSTED_ORIGINS = ['http://localhost:8000', 'http://127.0.0.1:8000']

