from django.db import models


class Score(models.Model):
    username = models.CharField(max_length=16)
    score = models.IntegerField()
    date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
