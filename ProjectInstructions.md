# event planner project

i want the website to make order for event planners and for the participants in the event

there can be many types of events and each event differ in its capabilities it provide to the host and participants
1. weddings
2. festivals
3. stand ups
4. concerts

the main features this event will have is: 
1. user premissions
   1. host - list of features that can be extandable
      1. can add/remove/edit participants to the evnet via veraiety of methods (csv, web gui) and can be expandable
         1. the user shell provide (via csv or webgui):
            1. name (must)
            2. last name (optional)
            3. number of atendee (must) - if above 1 then the name and last name is tagged as group if 1 then its tagged as single
            4. phone number (must)
      2. can send messeges for arrivle confirmation to participants (email, messege, whatsapp, automatic phone call)
         1. should save in server db 
      3. can make table arrangements (from participants db)
         1. create round and rectangles tables
         2. can drag and drop names from db to tables created
         3. see what participants is seated and whos left via the gui with v or x on the name
      4. can upload to a dedicated page photos and videos
         1. should be in the style of slack chat group 
         2. every participant and host can uplaod and comment videos and photos to the platform 
         3. liking and comment system 
         4. sharing to instegram facebook tiktok 
      5. can create side groups for the participants to be part of
         1. ridealong group
         2. technical group - if something missing at the weding and someone can arrange
         3. costum - can create whatever group they want
   2. participant - list of features that can be extandable
      1. the sign in is based on phone number and confirmation massege with code that sent to the phone number and when its received the code registers the website automaticly
      2. receive the confirmation messege as link to the website
         1. the website confirmation page should include 
            1. a view on how many participants there is 
            2. the name of the participant and option to add the names of the other participants and their phone number too
            3. a summery view of the uniqeness of the platform
               1. the abillity to upload photos and videos like and comment 
               2. the abillity to view the event after its endded for lifetime
               3. it needs to be summerize as much as it can and be practicle and apilling so the users will be convinced they should enter the rest of their families phone numbers and names
      3. can upload photos and videos to the feed page prior to the event
      4. can comment and upload to each of the groups
   3. Suppliers
      1. Suppliers can be for example
         1. photographers 
         2. wedding halls 
         3. caterer
         4. dj
         5. flower arranger
         6. and more
      2. the provider can create their page that should include:
         1. logo (profile photo)
         2. name of the business
         3. name and last name of the meneger
         4. phone number 
         5. email
         6. photos and videos of the business 
         7. short and long description
         8. ranking of the service from 1-10 (only host and participants that was in their event can rank)
         9. reviews of participants and host
            1. host reviews is seperated from participant review
      3. in each event the host can sign in the Suppliers he uses and they will be presented at the top of the main feed as a horizontal scrolabble circles of logos and a click on it will revil the short description phone number and photos more click will open their page

## technologies 
1. backend - typescript
2. frontend - react
3. database - mongodb
4. 