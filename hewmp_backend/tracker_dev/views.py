from django.http import HttpResponse

def index(request):
    content = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/static/tracker-dev/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lumi Tracker</title>
    <script type="module" crossorigin src="/static/tracker-dev/assets/index.js"></script>
    <link rel="stylesheet" href="/static/tracker-dev/assets/index.css">
  </head>
  <body>
    <div id="app"></div>
    
  </body>
</html>
"""
    return HttpResponse(content)
