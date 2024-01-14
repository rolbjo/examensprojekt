describe('My travel site', () => {
  it('Should display all destinations and navigate to one', () => {
    cy.visit('http://localhost:3000/destinations')
    cy.get('.Allh1').should('include.text', 'All Destinations')
    cy.get('.AllImg').should('have.length.greaterThan', 0)
    cy.get('.AllImg').eq(1).click()
    cy.location('pathname').should('match', /\/Dubai$/)
  })
})
