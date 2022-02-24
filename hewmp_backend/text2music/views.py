from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader
from hewmp.parser import parse_text, patterns_to_fractions, tracks_to_midi
from io import StringIO, BytesIO

# Create your views here.

def index(request):
    if request.method == 'POST':
        text = request.POST['score']
        patterns, config = parse_text(text, max_repeats=1000)
        if request.POST['type'] == 'fractions':
            sio = StringIO()
            patterns_to_fractions(patterns, sio)
            return HttpResponse('<pre>' + sio.getvalue() + '</pre>')
        elif request.POST['type'] == 'midi':
            bio = BytesIO()
            midi = tracks_to_midi(patterns)
            midi.save(file=bio)
            response = HttpResponse(bio.getvalue(), 'audio/midi')
            response['Content-Disposition'] = 'attachment; filename="text2music.mid"'
            return response
        else:
            raise ValueError("Unrecognized output format")
    template = loader.get_template('text2music/index.html')
    return HttpResponse(template.render({}, request))
