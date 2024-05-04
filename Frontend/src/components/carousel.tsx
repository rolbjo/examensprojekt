import React from 'react'
import { Carousel } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import '../styles/components/carousel.css'

interface CarouselProps {
  interval: number
}

const MyCarousel: React.FC<CarouselProps> = ({ interval }) => {
  return (
    <div className='CarouselDiv'>
      <Carousel interval={interval}>
        <Carousel.Item>
          <Link to={'/New York'}>
            <img
              className='d-block CarouselImg'
              src='/brooklyn-bridge-1791001_1280.jpg'
              alt='First slide'
            />
          </Link>
        </Carousel.Item>
        <Carousel.Item>
          <Link to={'/Dubai'}>
            <img
              className='d-block CarouselImg'
              src='/burj-khalifa-2212978_1280.jpg'
              alt='Second slide'
            />
          </Link>
        </Carousel.Item>
        <Carousel.Item>
          <Link to={'/Japan'}>
            <img
              className='d-block CarouselImg'
              src='/heritage-5430081_1280.jpg'
              alt='Second slide'
            />
          </Link>
        </Carousel.Item>
        <Carousel.Item>
          <Link to={'/Italy'}>
            <img
              className='d-block CarouselImg'
              src='/houses-4093227_1280.jpg'
              alt='Second slide'
            />
          </Link>
        </Carousel.Item>
      </Carousel>
    </div>
  )
}

export default MyCarousel
