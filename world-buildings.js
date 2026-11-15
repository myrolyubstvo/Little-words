/* Fifty distinct new illustrated building designs, each with a unique atlas frame and a real place in town. */
(()=>{
"use strict";
const groups=[
 ["cozy_civic",[
  ["Rosewood Community Hospital","hospital","Early twentieth-century limestone hospital","town",4,3],
  ["Little Lantern Children's Clinic","clinic","Peach-brick neighbourhood clinic","town",3,2],
  ["Sage & Thyme Apothecary","pharmacy","Traditional timber-fronted apothecary","town",2,2],
  ["Olive Courtyard Dental Clinic","clinic","Contemporary timber-and-glass clinic","metro",3,2],
  ["Rosebrick Fire Station","firestation","Red-brick arched firehouse","metro",3,2],
  ["Letters & Lanterns Post Office","postoffice","French stone and mansard architecture","town",3,2],
  ["Willow Primary School","school","Traditional red-brick schoolhouse","forest",4,3],
  ["Plaça College","university","Mediterranean neoclassical college","town",4,3],
  ["The Copper Cupola Library","library","Arched stone library with copper cupola","town",3,3],
  ["Bellflower Town Hall","townhall","Mediterranean civic arcade and bell tower","town",3,3]
 ]],
 ["cozy_social",[
  ["The Golden Reel Cinema","cinema","Art Deco picture house","town",3,2],
  ["Wisteria Picture House","cinema","European townhouse arthouse cinema","metro",3,2],
  ["The Velvet Lantern Theatre","theatre","Ornate neighbourhood music theatre","town",3,2],
  ["Café du Petit Matin","cafe","Parisian stone corner café","town",3,2],
  ["Cafè dels Llimoners","cafe","Catalan stucco café and ceramic terrace","town",3,2],
  ["Cedar & Coffee","cafe","Nordic timber coffee cabin","forest",2,2],
  ["The Stepped Gable Bakery","bakery","Dutch brick stepped-gable bakery","town",2,2],
  ["Gelateria Pistacchio","gelateria","Italian pistachio-coloured gelateria","harbour",2,2],
  ["Maple Lantern Tea House","teahouse","Traditional Japanese timber tea house","forest",3,2],
  ["The Curved Stair Bookshop","bookshop","Mediterranean courtyard bookshop","town",3,2]
 ]],
 ["cozy_homes",[
  ["Red Fjord House","house","Norwegian painted-timber house","forest",2,2],
  ["Geranium Chalet","house","Swiss timber chalet with carved balcony","country",3,2],
  ["Rosebeam Cottage","house","English Tudor timber-frame cottage","forest",3,2],
  ["Lattice Lane Machiya","house","Traditional Japanese machiya townhouse","forest",2,2],
  ["Casa de les Flors","house","Catalan stucco and ceramic townhouse","town",3,2],
  ["Little Canal House","house","Dutch brick stepped-gable townhouse","town",2,2],
  ["Lavender Shutters Cottage","house","Provençal limestone cottage","country",2,2],
  ["Blue Steps House","house","Greek Cycladic whitewashed architecture","harbour",3,2],
  ["The Olive Craftsman","house","American Craftsman timber bungalow","town",3,2],
  ["Peony Courtyard House","house","Traditional Chinese courtyard architecture","forest",3,2]
 ]],
 ["cozy_city",[
  ["The Sage Spire","skyscraper","Planted Art Deco residential tower","metro",2,2],
  ["Brick Garden Tower","skyscraper","Contemporary brick and glass residential tower","metro",2,2],
  ["The Mansard Lantern","skyscraper","Parisian-inspired stone apartment tower","metro",2,2],
  ["Timber Canopy Tower","skyscraper","Contemporary timber-and-glass garden tower","metro",2,2],
  ["Hotel Marigold","hotel","Mediterranean boutique hotel","town",3,3],
  ["Bellflower Railway Station","station","Traditional glazed-canopy railway station","metro",3,2],
  ["The Green Awning Grocer","shop","Traditional produce shop and upstairs home","town",2,2],
  ["Bloom & Stem Florist","florist","Timber shopfront with a small greenhouse","town",2,2],
  ["The Warm Kiln Pottery","workshop","Rustic plaster and timber pottery studio","country",2,2],
  ["The Little Record Room","recordshop","Independent terrace record shop","metro",2,2]
 ]],
 ["cozy_country",[
  ["Buttercup Farmhouse","farm","Swedish painted-timber farmhouse","country",3,2],
  ["Clover Meadow Barn","barn","Traditional red timber barn","country",3,2],
  ["Willowbrook Watermill","watermill","Limestone and timber watermill","country",3,2],
  ["Honeyhill Windmill","windmill","Traditional stone tower windmill","country",2,2],
  ["The Amber Snow Lodge","lodge","Snow-covered alpine timber lodge","winter",3,2],
  ["Snowdrop Hearth Bakery","bakery","Snow-covered traditional brick bakery","winter",2,2],
  ["Firefly Garden Conservatory","conservatory","Victorian-inspired iron-and-glass conservatory","forest",3,2],
  ["The Lavender Bell Chapel","chapel","Small traditional stone chapel","forest",2,2],
  ["La Brisa del Mar","restaurant","Mediterranean waterfront seafood restaurant","harbour",3,2],
  ["The Hearth Community House","community","Arts and Crafts community house","town",3,2]
 ]]
];
window.LWBuildingDesigns=groups.flatMap(([group,rows])=>rows.map((r,index)=>({
 id:group+"-"+index,group,frame:index,name:r[0],kind:r[1],architecture:r[2],zone:r[3],w:r[4],h:r[5]
})));
})();
