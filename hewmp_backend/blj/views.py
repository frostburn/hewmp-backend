from django.http import HttpResponse

def index(request):
    content = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/static/blj/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Temperament Game (BLJ edition)</title>
    <script type="module" crossorigin src="/static/blj/assets/index.1b7fe3ff.js"></script>
    <link rel="stylesheet" href="/static/blj/assets/index.83cb2986.css">
  </head>
  <body>
    <div id="app"></div>
    
  </body>
</html>


"""
    return HttpResponse(content)
