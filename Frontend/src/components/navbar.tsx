import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'

function NavbarComponent() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearchSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const response = await fetch(`/data/destinations?query=${searchQuery}`)

      if (!response.ok) {
        throw new Error('Failed to fetch destinations')
      }

      const data = await response.json()
      console.log('Fetched destinations:', data)

      const destinationName = data[0]?.name

      navigate(`/${destinationName}`)
      console.log(destinationName)
    } catch (error) {
      console.error('Error fetching destinations:', error)
    }
  }

  return (
    <Navbar sticky='top' expand='lg' className='bg-body-tertiary'>
      <Container fluid>
        <Navbar.Brand as={Link} to='/home'>
          Travel inspo
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='navbarScroll' />
        <Navbar.Collapse id='navbarScroll'>
          <Nav
            className='me-auto my-2 my-lg-0'
            style={{ maxHeight: '100px' }}
            navbarScroll
          >
            <Nav.Link as={Link} to='/home'>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to='/destinations'>
              Destinations
            </Nav.Link>
            <Nav.Link as={Link} to='/planning'>
              Trip Planner
            </Nav.Link>
            <Nav.Link as={Link} to='/about'>
              About
            </Nav.Link>
          </Nav>
          <Form className='d-flex ' onSubmit={handleSearchSubmit}>
            <Form.Control
              type='search'
              placeholder='Search'
              className='SearchField me-2 '
              aria-label='Search'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              className='SearchButton'
              variant='outline-success'
              type='submit'
            >
              Search
            </Button>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavbarComponent
