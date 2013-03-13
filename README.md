TVkaista-touch is a third party user interface for www.tvkaista.fi

Author has no relations to the company reponsible for the tvkaista service.

This project includes the following code:
* http://twitter.github.com/bootstrap/ Copyright 2012 Twitter, Inc. - Licensed under the Apache License, Version 2.0 
* https://github.com/carhartl/jquery-cookie Copyright 2013 Klaus Hartl - MIT Licensed

Files test.html, test.py and js/tv.js are GPL licensed.

The rest of the documentation is in Finnish only.

TVkaista-touch
==============

TVkaista-touch on tablet-laitteille tarkoitettu käyttöliittymä TVKaistalle. Projekti on olemassa,
koska tvkaistan www-sivujen tietokonenäkymä eikä myöskään mobiilinäkymä ole kovin käytettäviä tablet-laitteilla.

Käyttöliittymän html5/javascript on GPL-lisenssoitu, samoin "dummy"-rajapinnan tarjoava sovellus test.py .
Tuotannossa (http://tvkaista-touch.appspot.com) oleva rajapintakoodi ei ole julkista.

"Dummy"-versio on ajossa [heroku](http://www.heroku.com) -alustalla osoitteessa
http://tvkaista-touch-public.herokuapp.com/test.html , jossa käyttöliittymää voi testata ilman
tvkaistan tunnusta. Ajossa on tämä githubissa oleva koodi sellaisenaan.

Rajapinta on toteutettu Googlen tekemällä webapp2 -kirjastolla. Asennusohjeet löytyvät osoitteesta
http://webapp-improved.appspot.com/tutorials/quickstart.nogae.html

Kun ympäristö on kunnossa, sovelluksen voi käynnistää komennolla

    python test.py

ja käyttöliittymää voi testata menemällä selaimella osoitteeseen http://127.0.0.1:8080/test.html
> Huom. www-serveri on auki myös "maailmalle", eli myös muilta laitteilta
> pääsee testaamaan käyttöliittymää, mikäli portti 8080 on sallittu koneesi paikallsesta palomuurista.
> Serverin tietoturva ei ole sellainen mitä luultavasti tahtoisit sen olevan, ja sitä kautta
> saattaa päästä käsiksi mihin tahansa kotikoneesi tiedostoon. 


