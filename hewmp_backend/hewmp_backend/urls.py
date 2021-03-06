"""hewmp_backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from .views import index

urlpatterns = [
    path('', index),
    path('text2music/', include('text2music.urls')),
    path('audio-eval/', include('audio_eval.urls')),
    path('mos-keyboard/', include('mos_keyboard.urls')),
    path('tracker/', include('tracker.urls')),
    path('tracker-dev/', include('tracker_dev.urls')),
    path('temperament-game/', include('temperament_game.urls')),
    path('blj/', include('blj.urls')),
    path('admin/', admin.site.urls),
]
