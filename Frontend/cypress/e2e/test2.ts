import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor'

Given('Jag är på hemsidan och ser slumpa knappen', () => {
  cy.visit('http://localhost:3000/')
})

When('Jag klickar på knappen', () => {
  cy.get('.RandomButton').click()
})

Then('Ett land med info visas', () => {
  cy.get('.MainContainer').should('exist')
  cy.get('h1').should('exist')
})
