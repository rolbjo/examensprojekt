import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/pages/allDestinations.scss'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

interface DestinationData {
  id: number
  name: string
  sights: string[]
  when_to_travel: string[]
  img: string
}

const AllDestinations: React.FC = () => {
  const [destinations, setDestinations] = useState<DestinationData[]>([])

  const fetchAllDestinations = async () => {
    try {
      const response = await fetch('/data/destinations', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'), // Include the JWT in the Authorization header
        },
      })

      if (!response.ok) {
        throw new Error('Not authorized')
      }

      const data = await response.json()
      setDestinations(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
  useEffect(() => {
    fetchAllDestinations()
  }, [])

  return (
    <Container>
      <h1 className='Allh1'>All Destinations</h1>
      <Row>
        {destinations.map((destination) => (
          <Col key={destination.id} sm={6} md={4} lg={3} xl={2}>
            <Link className='AllName' to={`/${destination.name}`}>
              <img
                src={destination.img}
                alt={destination.name}
                className='img-fluid AllImg'
              />
              <p>{destination.name}</p>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  )
}

export default AllDestinations
