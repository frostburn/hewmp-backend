import json
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.template import loader
from hewmp.parser import parse_text, patterns_to_fractions, patterns_to_cents, tracks_to_midi, prune, realize, freq_to_midi_et
from io import StringIO, BytesIO

# Create your views here.

def index(request):
    if request.method == 'POST':
        if not request.POST:
            data = json.loads(request.body)
        else:
            data = request.POST
        text = data['score']
        patterns, config = parse_text(text, max_repeats=1000)
        if data['type'] == 'fractions':
            sio = StringIO()
            patterns_to_fractions(patterns, sio)
            return HttpResponse('<pre>' + sio.getvalue() + '</pre>')
        elif data['type'] == 'cents':
            sio = StringIO()
            patterns_to_cents(realize(patterns, preserve_spacers=True), sio, config["tuning"].base_frequency)
            return HttpResponse('<pre>' + sio.getvalue() + '</pre>')
        elif data['type'] in ('midi', 'midi ET'):
            bio = BytesIO()
            if data['type'] == 'midi ET':
                et_divisions = config["tuning"].et_divisions
                et_divided = config["tuning"].et_divided
                freq_to_midi = lambda freq: freq_to_midi_et(freq, et_divisions, et_divided)
                midi = tracks_to_midi(patterns, freq_to_midi)
            else:
                midi = tracks_to_midi(patterns)
            midi.save(file=bio)
            response = HttpResponse(bio.getvalue(), 'audio/midi')
            response['Content-Disposition'] = 'attachment; filename="text2music.mid"'
            return response
        elif data['type'] == 'json':
            return JsonResponse({"tracks": prune(patterns)})
        else:
            raise ValueError("Unrecognized output format")
    template = loader.get_template('text2music/index.html')
    return HttpResponse(template.render({}, request))
