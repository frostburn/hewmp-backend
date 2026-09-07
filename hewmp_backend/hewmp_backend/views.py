from django.http import HttpResponse

def index(request):
    html = '''
    <html>
    <head><title>Lumi Pakkanen | Music, Theory & Free Software</title></head>
    <body>
        <h2>Projects</h2>
        <a href="https://scaleworkshop.plainsound.org/">Scale Workshop 3</a><br>
        <a href="https://xenpaper.lumipakkanen.com/">Xenpaper 2</a><br>
        <a href="https://xenpaper3.lumipakkanen.com/">Xenpaper 3</a>
        <h2>Arhives</h2>
        <a href="https://jarzombek.lumipakkanen.com/">Ralph Jarzombek - Microtonal music archive</a>
        <h2>Dead projects</h2>
        <a href="/tracker/">LumiTracker</a><br>
        <a href="/temperament-game/">Temperament "Game"</a><br>
        <a href="/text2music/">Text2Music</a><br>
        <a href="/mos-keyboard/">MOS Keyboard</a><br><br>
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
