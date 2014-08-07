TVkaista-touch is a third party user interface for www.tvkaista.fi

Author has no relations to the company reponsible for the tvkaista service.

This project includes the following code:
* http://twitter.github.com/bootstrap/ Copyright 2012 Twitter, Inc. - Licensed under the Apache License, Version 2.0 
* https://github.com/carhartl/jquery-cookie Copyright 2013 Klaus Hartl - MIT Licensed
* http://jquerymobile.com Copyright 2013 jQuery Foundation, Inc. - MIT Licensed

Files test.html, test.py and js/tv.js are GPL licensed.

The rest of the documentation is in Finnish only.

TVkaista-touch
==============

TVkaista-touch on tablet-laitteille tarkoitettu käyttöliittymä TVKaistalle. Projekti on olemassa,
koska tvkaistan www-sivujen tietokonenäkymä eikä myöskään mobiilinäkymä ole kovin käytettäviä tablet-laitteilla.

Käyttöliittymän html5/javascript on GPL-lisenssoitu, samoin "dummy"-rajapinnan tarjoava sovellus test.py .
Tuotannossa (http://tvkaista-touch.appspot.com) oleva rajapintakoodi ei ole julkista.

"Dummy"-versio on ajossa [heroku](http://www.heroku.com) -alustalla osoitteessa
http://tvkaista-touch-public.herokuapp.com/ , jossa käyttöliittymää voi testata ilman
tvkaistan tunnusta. Ajossa on tämä githubissa oleva koodi sellaisenaan.

Rajapinta on toteutettu Googlen tekemällä webapp2 -kirjastolla. Asennusohjeet löytyvät osoitteesta
http://webapp-improved.appspot.com/tutorials/quickstart.nogae.html

Kun ympäristö on kunnossa, sovelluksen voi käynnistää komennolla

    python test.py

ja käyttöliittymää voi testata menemällä selaimella osoitteeseen http://127.0.0.1:8080/
> Huom. www-serveri on auki myös "maailmalle", eli myös muilta laitteilta
> pääsee testaamaan käyttöliittymää, mikäli portti 8080 on sallittu koneesi paikallsesta palomuurista.

Sovelluksen ajaminen Herokussa on äärimmäisen helppoa: Paina tätä alla olevaa nappia:

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

ja saat oman heroku-sovelluksen, jonka koodin voit kloonata itsellesi ja viedä muutokset takaisin herokun git-repoon.

Vaihtoehtoisesti jos tahdot käyttää herokua perinteisesti, katso ensin
https://devcenter.heroku.com/articles/quickstart . Pitää vain asentaa herokun "toolbelt",
ja sen jälkeen riittää ajaa nämä komennot:

    git clone git://github.com/viljoviitanen/tvkaista-touch-public
    cd tvkaista-touch-public
    heroku create
    git push heroku master
    heroku open
