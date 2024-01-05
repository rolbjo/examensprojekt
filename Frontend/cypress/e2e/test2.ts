import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor'

Given('Jag är på hemsidan och ser slumpa knappen', () => {
  cy.visit('http://localhost:5173/')
})

When('Jag klickar på knappen', () => {
  cy.get('.RandomButton').click()
})

Then('Ett land med info visas', () => {
  cy.get('.RandomDest').should('exist')
  cy.get('.DestName').should('contain.text', 'Dubai')
})
