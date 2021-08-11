NodeJs / VueJs/Nuxt Web App

This web app is a page scraper application. 

When using the Nuxt Component, which in turn calls the NodeJs webserver (running on Express) will call a website (https) and request a high level view of it's pages.

These pages are then pulled back into a local 'cache' directory which contains a .json file which represents a parsed value, for the contents of the website in question.

Using a NodeJs/Express app, NodeJs and Google Charts it's possible to pull down the request and create a summary for the words used on the site/page. Once this information is pulled into a simple chart it's possible to understand the general leanings of a page and it's put it's contents into a simple column chart.

NodeJs App Dependancies:
1, Express.

Nuxt App Dependancies:
1, Google Charts,
2, Matterialize (Assume loaded as static content into the Nuxt app)

The Nuxt Component/Pages are pretty simple.

Pages: 
1, Index is the initial home page, which is the landing page for the Nuxt app.
2, Detail is the detail page, so information about the individual sites which have been sampled.

Components:
1, The Home component is simply here to display the available websites which have been cached and display a summary for the most popular top level pages directory "/".
2, The ShowDetail component will show the detail for a given content item. For which the detail is the structure and the content of the desired sites/pages (top level in chart form)
3, ModalComponent is here to simply display the contents of an individual sites page in a modal form.

