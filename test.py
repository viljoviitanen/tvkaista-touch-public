#!/usr/bin/env python
# This Python file uses the following encoding: utf-8
# vim: set autoindent:

# Copyright (C) 2013 Viljo Viitanen
# 
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

import webapp2
import json
import time
import re
import os

class LoginHandler(webapp2.RequestHandler):
  def post(self):
    if self.request.POST['u'] != '' and self.request.POST['p'] != '' :
      resp="ok"
    elif self.request.POST['u'] == '':
      resp="käyttäjätunnus puuttuu"
    else:
      resp="salasana puuttuu"
    self.response.headers['Content-Type'] = 'application/json'   
    self.response.write(json.dumps( { 'login': resp } ))

class MenuHandler(webapp2.RequestHandler):
  def post(self):
    res='error'
    try:
      #CSRF preventation token
      if self.request.cookies.get('token') == self.request.POST['token']:
        res='ok'
    except KeyError:
      pass
    time.sleep(1)
    self.response.headers['Content-Type'] = 'application/json'   
    self.response.write(json.dumps( { 'result': res } ))

class ListSeasonPassesHandler(webapp2.RequestHandler):
  def get(self):
    self.response.headers['Content-Type'] = 'application/json'   
    self.response.write(json.dumps( {"seasonpasses": [ {"name": "Ohjelma A", "id": "1000"}, {"name": "Ohjelma B", "id": "1001"}, {"name": "Ohjelma C", "id": "1002"} ]} ))

class ChannelHandler(webapp2.RequestHandler):
  def get(self):
    self.response.headers['Content-Type'] = 'application/json'   
    self.response.write(json.dumps( {"channels": [{"name": "YLE TV1", "id": "100"}, {"name": "YLE TV2", "id": "101"}, {"name": "MTV3", "id": "102"}, {"name": "Nelonen", "id": "103"}, {"name": "YLE FEM", "id": "104"}, {"name": "Sub", "id": "105"}, {"name": "YLE Teema", "id": "106"}, {"name": "Liv", "id": "107"}, {"name": "JIM", "id": "108"}, {"name": "TV Viisi", "id": "109"}, {"name": "Kutonen", "id": "110"}, {"name": "FOX", "id": "111"}, {"name": "AVA", "id": "112"}]} ))


class ProgramHandler(webapp2.RequestHandler):
  def get(self):
    channel=self.request.GET['channel']
    day=self.request.GET['day']
    time.sleep(0.5)
    if day=="today":
      hour=18
    else:
      hour=24
    resp=[]
    i=0
    basetime=time.time()-hour*3600
    while i<hour:
      resp.append({ 'time': 1000*(basetime+3600*i), 'purl': 'http://s3.amazonaws.com/viljoviitanen/WP_20130315_110705Z.mp4', 'title': ('Ohjelma %d'%i), 'desc': 'Ohjelman kuvaus', 'ch': 'KANAVA', 'id': 10000+i, 'dur': 100+i})
      i=i+1

    self.response.headers['Content-Type'] = 'application/json'   
    self.response.write(json.dumps( { 'result': resp } ))

class SearchHandler(webapp2.RequestHandler):
  def get(self):
    time.sleep(2)
    #search=self.request.GET['search']
    resp=[]
    i=0
    hour=20
    basetime=time.time()-hour*3600
    while i<hour:
      resp.append({ 'time': 1000*(basetime+3600*i), 'purl': 'http://s3.amazonaws.com/viljoviitanen/WP_20130315_110705Z.mp4', 'title': ('Ohjelma %d'%i), 'desc': 'Ohjelman kuvaus', 'ch': 'KANAVA', 'id': 10000+i, 'dur': 100+i})
      i=i+1

    self.response.headers['Content-Type'] = 'application/json'   
    self.response.write(json.dumps( { 'result': resp } ))

class ScriptHandler(webapp2.RequestHandler):
  def get(self):

    self.response.headers['Content-Type'] = 'application/javascript' 
    self.response.write("""
document.write('<div class="notlogged hide well container">')
document.write('Tämä on tvkaista-touchin kehitysversio, joka näyttää vain "dummy" -sisältöä. Koodi on <a href="https://github.com/viljoviitanen/tvkaista-touch-public">githubissa</a>.')
document.write('<p>Käyttäjätunnukseksi ja salasanaksi käy mitä tahansa, kunhan eivät ole tyhjiä.')
document.write('<p><a onclick="changelog()">Muutoshistoria</a> ')
document.write('</div>')
""")

class FileHandler(webapp2.RequestHandler):
  def get(self,path):

    if (path==''):
      path='test.html'
    if re.search('html$',path):
      self.response.headers['Content-Type'] = 'text/html' 
    elif re.search('css$',path):
      self.response.headers['Content-Type'] = 'text/css' 
    elif re.search('txt$',path):
      self.response.headers['Content-Type'] = 'text/plain' 
    elif re.search('js$',path):
      self.response.headers['Content-Type'] = 'application/javascript' 
    elif re.search('gif$',path):
      self.response.headers['Content-Type'] = 'image/gif' 
    elif re.search('png$',path):
      self.response.headers['Content-Type'] = 'image/png' 
    else:
      self.abort(403)
    try:
      f=open("./"+path,'r')
    except IOError:
      self.abort(404)
    self.response.write(f.read())
    f.close

app = webapp2.WSGIApplication([
    ('/login', LoginHandler),
    ('/menu', MenuHandler),
    ('/channels', ChannelHandler),
    ('/programs', ProgramHandler),
    ('/playlist', SearchHandler),
    ('/seasonpasses', SearchHandler),
    ('/listseasonpasses', ListSeasonPassesHandler),
    ('/search', SearchHandler),
    ('/script', ScriptHandler),
    (r'/(.*)', FileHandler),
], debug=True)

def main():
    from paste import httpserver
    port = int(os.environ.get('PORT', 8080))
    httpserver.serve(app, host='0.0.0.0', port=port)

if __name__ == '__main__':
    main()
