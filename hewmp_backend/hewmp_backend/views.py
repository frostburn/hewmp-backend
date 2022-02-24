from django.http import HttpResponse

def index(request):
    html = '''
    <html>
    <head><title>Lumi Pakkanen | Music, Theory & Free Software</title></head>
    <body>
        Follow my socials:<br>
        <a href="https://www.youtube.com/channel/UCPzZoMs2YRIOfgraYQutXaA">YouTube</a><br>
        <a href="https://soundcloud.com/frostburn">SoundCloud</a><br>
        <a href="https://twitter.com/LumiPakkanen">Twitter</a><br>
        <a href="https://www.instagram.com/lumipakkanen/">Instagram</a><br>
        <a href="https://www.patreon.com/frostburn">Patreon</a>
    </body>
    </html>
    '''
    return HttpResponse(html)
