from django.contrib import admin
from django.urls import path
import core.views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("consonant/", core.views.consonant, name="consonant"),
    path("vowel/", core.views.vowel, name="vowel"),
    path("consonant/<str:token>", core.views.consonant, name="consonant"),
    path("vowel/<str:token>", core.views.vowel, name="vowel"),
    path("verifyword/<str:token>/<str:word>", core.views.verifyWord, name="verify"),
    path("score/<str:msg>", core.views.score, name="score"),
    path("letters/", core.views.letters, name="letters"),
    path("play/", core.views.play, name="play"),
    path("", core.views.index, name="home"),
]
