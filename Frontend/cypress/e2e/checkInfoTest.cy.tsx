describe('My travel site', () => {
  it('Should display destination info', () => {
    cy.visit('http://localhost:3000/Dubai')

    cy.get('.Desth1').should('include.text', 'Dubai')
    cy.get('.WhenToTravel').should('include.text', 'Winter')
  })
})
