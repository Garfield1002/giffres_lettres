from django.db.models.expressions import Window
from django.http.request import HttpRequest
from django.shortcuts import redirect, render
import random
import time
from cryptography.fernet import Fernet
from django.http import HttpResponse
from django.db.models import Sum, F
from django.db.models.functions import Rank
from .models import Score

import os

KEY = os.environ.get("FERNET_KEY").encode("ascii")

with open("francais.txt", "r") as f:
    french = set(map(lambda l: l.strip(), f.readlines()))

FERNET = Fernet(KEY)

LETTER_TIME = 30
WORD_TIME = 90

VOWELS = "AEIOUY"
CONSONANTS = "BCDFGHJKLMNPQRSTVWXZ"

# The main logic behind a letters turn
def letterTurn(token: str, choice: str) -> HttpResponse:
    def response(msg: str):
        signature: bytes = FERNET.encrypt_at_time(
            data=msg.encode("ascii"), current_time=int(time.time())
        )
        return msg + "." + signature.decode("ascii")

    msg = ""
    if token is not None:
        msg = FERNET.decrypt(token.encode("ascii"), ttl=LETTER_TIME).decode("ascii")

    msg += random.choice(choice)

    return HttpResponse(response(msg))


def consonant(_, token=None):
    return letterTurn(token, CONSONANTS)


def vowel(_, token=None):
    return letterTurn(token, VOWELS)


def verifyWord(request, token: str, word: str):
    username = request.COOKIES.get("username")
    if username is None:
        return redirect("home")

    letters: str = FERNET.decrypt(token.encode("ascii"), ttl=WORD_TIME).decode("ascii")

    for c in word:
        try:
            pos = letters.index(c)
            letters = letters[:pos] + letters[(pos + 1) :]
        except ValueError:
            raise Exception("Cheater")

    if word in french:
        points = len(word) ** 2

        score = Score(username=username, score=points)
        score.save()

        return HttpResponse(
            f"Bien joué, tu marques {points} point{'s' if len(word) > 1 else ''}"
        )

    return HttpResponse(
        f"Le but c'est de rentrer des mots FRANÇAIS en fait. Essaye une autre fois."
    )


def play(request: HttpRequest):
    username = request.GET.get("username", None)
    if username is None:
        return redirect("home")
    response = redirect("letters")
    response.set_cookie("username", username)
    return response


def index(request):
    username = request.COOKIES.get("username")
    if username == None:
        username = "Avengif"
    return render(request, "index.html", {"username": username})


def score(request, msg: str):
    username = request.COOKIES.get("username")
    result = (
        Score.objects.values("username")
        .annotate(total_score=Sum("score"))
        .order_by("-total_score")
        .annotate(rank=Window(expression=Rank(), order_by=F("total_score").desc()))
    )
    top5 = list(result[0:5])

    if username is not None:
        if username in [d["username"] for d in top5]:
            top5[[d["username"] for d in top5].index(username)]["me"] = True
        else:
            my_result = list(result.filter(username=username))[0]
            if len(my_result) > 0:
                my_result["me"] = True
                my_result["rank"] = result.filter(
                    total_score__gte=my_result["total_score"]
                ).count()
                top5.append(my_result)

    return render(
        request, "score.html", {"msg": msg, "username": username, "top5": top5}
    )


def letters(request):
    username = request.COOKIES.get("username")
    if username is None:
        return redirect("home")
    return render(request, "letters.html", {"username": username})
