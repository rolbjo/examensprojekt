describe('Carousel', () => {
  it('Should show a destination when searching', () => {
    cy.visit('http://localhost:3000')

    cy.wait(1000)

    cy.get('.SearchField').type('Japan')
    cy.get('.SearchButton').click()
    cy.get('.SearchField').clear().type('Dub{enter}', { force: true })
  })
})
