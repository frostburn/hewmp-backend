from django.http import HttpResponse

def index(request):
    content = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/static/temperament-game/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Temperament Game</title>
    <script type="module" crossorigin src="/static/temperament-game/assets/index.5c691c32.js"></script>
    <link rel="stylesheet" href="/static/temperament-game/assets/index.9d10c201.css">
  </head>
  <body>
    <div id="app"></div>
    
  </body>
</html>
"""
    return HttpResponse(content)
