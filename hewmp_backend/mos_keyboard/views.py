import json
from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader

# Create your views here.

def index(request):
    template = loader.get_template('mos-keyboard/index.html')
    return HttpResponse(template.render({}, request))
