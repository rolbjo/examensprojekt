import Carousel from '../../src/components/carousel'

describe('Carousel', () => {
  it('should navigate through carousel slides', () => {
    mount(<Carousel />)

    cy.get('.carousel').should('be.visible')

    cy.get('.carousel-control-next').click()
  })
})
