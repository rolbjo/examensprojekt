Feature: Slumpdestination

Det ska finnas en knapp på hemsidan. När man trycker på den så
ska ett slumpmässigt land med info visas.

Scenario: Jag klickar på knappen för ett nytt land
Given Jag är på hemsidan och ser slumpa knappen
When Jag klickar på knappen
Then Ett land med info visas

Scenario: Jag klickar på knappen igen för ett nytt land
Given Jag är på hemsidan och ser slumpa knappen
When Jag klickar på knappen igen
Then Ett nytt land med info visas
