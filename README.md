# anon-web-scrapper
<b>The Website and Config files are left out becuase this project is meant for educational purposes.</b>

## How
Goal : given any series, scrape every video link (corresponding to each episode).
</br>
Note : to access the video links an on-screen 'play' button must be clicked.

### Attempt 1 : Casper & Phantom
I decided to use CasperJS & PhantomJS to create a headless browser, which would click the on-screen button, and
scrap the new HTML (with the loaded videolink). The website was able to realize the headless browsers, and instead of 
loading the video links, it loaded something along the lines of 'To view our website, please vist {website} in your browser'.

### Attempt 2 : tor-request
Using Google's Dev Tools I monitored the network activity, while I clicked the on-screen button.
I noticed that a simple GET request was used to fetch the video link of the current episode using parameters to identify 
the series and episode number. 
</br>
For any given episode I was able to find and scrap all but one integer parameter, leading to the unknown integer parameter being called 'mystery'.
</br>
</br>
After testing more, I found that at most this mystery parameter is 4 digits, is usually around the values of 1300-1500, and some mystery parameters 
are reused. I also realised that only when the mystery parameter was correct the JSON response would contain a property of 'target' which would
contain the video link.
Using TOR to mask my IP address, I would first attempt to fetch with the 'known-mysteries' (mystery parameters which have worked in previous
scrapes), and then attempt a brute-force algorithm to get the response with the video link.
</br>
</br>
<b>Success!</b>
</br>
From then on the task was fairly straight forward.
</br>
</br>
Overall
* Scrape the website for all website based links corresponding to every episode ({website}/watch/epi1, {website}/watch/epi2)
* For each link in the previous step scrape the video link (www.{video-hosting-website}.com/AKJSDHFL)
* For each link obtained in the previous step scrape the corresponding direct .mp4 links
* Scrape Wikipedia for the names of corresponding episodes
* Store both the .mp4 links and names into Google's firebase



## Why
I wanted to learn more about webscrapping, website structure, and Google's firebase. </br>
