# Progetto ProductVisualization
![Image screen of the project, developed in three.js](img/screen.PNG)

## Goals

The well-known ACME company has asked you to build a product **Web visualizer / configurator** for its new e-commerce site. Before giving you the job, ACME wants to evaluate how faithfully you can visualize and configure products.  ACME sells everything, so you can choose whatever kind of product you want for the demonstration.

Your goal is to build a Web application (a HTML page) that:

- visualizes a product in 3D using three.js, using PBR equations and materials;
- allows the user to inspect the product (e.g. by orbiting the camera around it), and change some material on it by choosing from a few alternatives.

Try to make it look like a simple, but real portion of an e-commerce site, not a three.js example: choose carefully colors, fonts, images, and icons, also taking inspiration from real web sites. Before starting, search the web for existing 3D configurators. Note down what you like and don't like, and try to produce a result as professional as possible.

## Documenting and report

Il progetto finale consiste in una pagina HTML costruita similarmente ad una convenzionale pagina di un e-commerce che mette a disposizione dell'utente un visualizzatore 3D dell'oggetto con alcune possibilità di customizzazione oltre ad una breve descrizione dell'oggetto stesso e dei materiali.

### Contenuto della scena
Il visualizzatore è composto da una Canvas che ospita la scena 3D, la scena è composta da:
- OBJ il modello di una sedia ispirato all'iconico design realizzato da Moroso per il marchio Diesel nel 2010 (credit per il modello ad Aplusstudio https://www.cgtrader.com/free-3d-models/furniture/chair/diesel-rock-chair-by-moroso).
- Alla scena sono stati aggiunti un Piano ed un Cubo per simularne pavimento e pareti (dopo alcuni tentativi con envMap e cubeMap con risultati non soddifascenti) ai quali sono stati passati dei materiali MeshPhongMaterial di THREE.js 
- La scelta delle luci è stata fatta in base a un tutorial del motore di rendering Arnold in cui si mostrava l'utilizzo delle area light per riprodurre l'effetto studio fotografico classico dei render per i prodotti. Le area light possono essere in qualche modo paragonate alle SpotLight usate nel nostro codice con la possibilità di modificare i parametri di: colore, intensità, distanza, angolo, penombra e decadimento. Le RectAreaLight di threejs sono state scartate a priori per la mancanza del supporto per le ombre. Per creare l'effetto studio quindi sono state posizionate tre luci con parametri diversi a seconda della resa: una in cima, più leggera delle altre, che serve a illuminare la scena dall'alto e dare la tonalità generale dell'oggetto illuminato, le altre due ai lati invece utilizzate più per smorzare le ombre della luce in alto e per creare dei riflessi di tonalità diversi (una gialla e una blu). Per quanto riguarda gli altri parametri sono stati modificati soltanto l'angolo, la penombra e il decadimento in base alla potenza delle ombre sul pavimento e alla tonalità generale risultante dai riflessi nell'oggetto illuminato. Con l'utilizzo delle SpotLight è stato possibile creare le relative shadowMap e poter ricevere/trasmettere le ombre tra oggetti in scena e pavimento. 
Per quanto riguarda la luce generale è stato utilizzato anche l'ambientOcclusion tramite la texture del materiale utilizzato poi nel codice degli shader per il diffuse generale. L'environment map invece è stata camuffata con l'inserimento della scena all'interno di un box la cui luce non è quella che si vede nel render ma è data da una cubemap esterna che potesse avere lo stesso effetto dei muri visibili. 
- Al modello sono state applicati diversi materiali per i quali sono stati realizzati diversi shader:

        1. materiale Metal Painted: texture based material che comprende le mappe per colore (diffuse), normale (o bump), roughness, ambientOcclusion, envMap (per i riflessi).

        2. materiale dorato: SpecularBRDF vista a lezione e negli esercizi, sprovvista di termine diffusivo.

        3. materiale plastico: BRDF con microfacing vista a lezione e negli esercizi.
        

### Strumenti messi a disposizione
L'utente si troverà i seguenti strumenti per interagire con il modello:
- Camera mobile attraverso orbitControl con l'accortezza di limitare i muovimenti per evitare artefatti o compenetrazione tra camera ed oggetti
- Radiobutton integrati nell'HTML per permettere il passaggio tra i diversi materiali per ognuna delle 3 parti che compongono il modello (Seduta, Struttura e Gambe).
- ColorPicker per permettere all'utente di cambiare il colore del materiale Plastico (non sono state date altre possibilità di customizzazione per matenere un senso di realisticità).

## Credit per gli elementi impiegati
- L'OBJ è stato prelevato dal portale cgtrader con come autore Aplusstudio al seguente link https://www.cgtrader.com/free-3d-models/furniture/chair/diesel-rock-chair-by-moroso con Royalty Free License
- Le texture per i materiali sono state tutte prelevate dal seguente portale: https://3dtextures.me/ con CC0 come grado di licenza.
- Il template è stato preso dal portale bootsnipp.com ed è sotto la MIT license
- Il CSS è distribuito da Bootsrap ed è open source
- Frammenti di codice e Shader sono stati prelevati dalle dispense e dagli esercizi del corso non che dal repository git messo a disposizione dal docente: https://github.com/Interactive3DGraphicsCourse-UNIUD-2020/example-code