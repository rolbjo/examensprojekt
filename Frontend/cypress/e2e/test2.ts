import {
  When,
  Then,
  Given,
  Before,
} from '@badeball/cypress-cucumber-preprocessor'

Before(() => {
  cy.visit('http://localhost:3000/')
})

const clickRandomButton = () => {
  cy.get('.RandomButton').click()
}

Given('Jag är på hemsidan och ser slumpa knappen', () => {})

When('Jag klickar på knappen', () => {
  clickRandomButton()
})

Then('Ett land med info visas', () => {
  cy.url().should('include', 'fromRandom=true')
  cy.get('.MainContainer').should('exist')
  cy.get('h1').should('exist')
})

When('Jag klickar på knappen igen', () => {
  clickRandomButton()
})

Then('Ett nytt land med info visas', () => {
  cy.get('.MainContainer').should('exist')
  cy.get('h1').should('exist')
})
