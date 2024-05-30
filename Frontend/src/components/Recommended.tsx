import React from 'react'
import '.././styles/components/recommended.css'

const Recommended: React.FC = () => {
  const [formValues, setFormValues] = React.useState({
    season: 'Spring',
    continent: 'Africa',
    expense: 'Affordable',
    culture: 'High',
    nature: 'High',
    food: 'High',
    architecture: 'High',
    nightlife: 'High',
  })

  const [country, setCountry] = React.useState(null)
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/recommended', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      console.log('Data:', data)
      setCountry(data)
    } catch (err) {}
  }

  const handleChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    })
    console.log(formValues)
  }
  return (
    <div style={{ width: '20%', marginRight: '50px', marginTop: '120px' }}>
      <div style={{ position: 'sticky', top: '30px' }}>
        <h2 className='text-3xl font-bold underline'>
          Find your next destination
        </h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor='season'>Select Season:</label>
          <select
            className='form-select form-select-sm '
            id='season'
            name='season'
            value={formValues.season}
            onChange={handleChange}
            aria-label='Select season'
          >
            <option value='Spring'>Spring</option>
            <option value='Summer'>Summer</option>
            <option value='Fall'>Fall</option>
            <option value='Winter'>Winter</option>
          </select>
          <br />
          <label htmlFor='continent'>Select Continent:</label>
          <select
            className='form-select form-select-sm '
            id='continent'
            name='continent'
            value={formValues.continent}
            onChange={handleChange}
            aria-label='Select continent'
          >
            <option value='Africa'>Africa</option>
            <option value='Asia'>Asia</option>
            <option value='Europe'>Europe</option>
            <option value='North America'>North America</option>
            <option value='South America'>South America</option>
            <option value='Oceania'>Australia</option>
          </select>
          <br />
          <label htmlFor='expense'>Select Expense Level:</label>
          <select
            className='form-select form-select-sm '
            id='expense'
            name='expense'
            value={formValues.expense}
            onChange={handleChange}
            aria-label='Select expense level'
          >
            <option value='Affordable'>Affordable</option>
            <option value='Moderate'>Moderate</option>
            <option value='Expensive'>Expensive</option>
          </select>
          <br />
          <label htmlFor='culture'>Select Cultural Interest:</label>
          <select
            className='form-select form-select-sm '
            id='culture'
            name='culture'
            value={formValues.culture}
            onChange={handleChange}
            aria-label='Select cultural interest'
          >
            <option value='High'>High</option>
            <option value='Moderate'>Moderate</option>
            <option value='Low'>Low</option>
          </select>

          <br />
          <label htmlFor='nature'>Select Nature Interest:</label>
          <select
            className='form-select form-select-sm '
            id='nature'
            name='nature'
            value={formValues.nature}
            onChange={handleChange}
            aria-label='Select nature interest'
          >
            <option value='High'>High</option>
            <option value='Moderate'>Moderate</option>
            <option value='Low'>Low</option>
          </select>
          <br />
          <label htmlFor='food'>Select Food Interest:</label>
          <select
            className='form-select form-select-sm '
            id='food'
            name='food'
            value={formValues.food}
            onChange={handleChange}
            aria-label='Select food interest'
          >
            <option value='High'>High</option>
            <option value='Moderate'>Moderate</option>
            <option value='Low'>Low</option>
          </select>
          <br />
          <label htmlFor='architecture'>Select Architecture Interest:</label>
          <select
            className='form-select form-select-sm '
            id='architecture'
            name='architecture'
            value={formValues.architecture}
            onChange={handleChange}
            aria-label='Select architecture interest'
          >
            <option value='High'>High</option>
            <option value='Moderate'>Moderate</option>
            <option value='Low'>Low</option>
          </select>

          <br />
          <label htmlFor='nightlife'>Select Nightlife Interest:</label>
          <select
            className='form-select form-select-sm '
            id='nightlife'
            name='nightlife'
            value={formValues.nightlife}
            onChange={handleChange}
            aria-label='Select nightlife interest'
          >
            <option value='High'>High</option>
            <option value='Moderate'>Moderate</option>
            <option value='Low'>Low</option>
          </select>
          <br />
          <input
            style={{
              padding: '1px',
              borderRadius: '5px',
              backgroundColor: 'antiquewhite',
              cursor: 'pointer',
            }}
            type='submit'
            value='Submit'
          />
        </form>
        {country && (
          <div className='resultContainer'>
            <h3>Your recommended destination is:</h3>
            <p>{country.country}</p>
            <p>{country.description}</p>
            {/* Add more fields as necessary */}
          </div>
        )}
      </div>
    </div>
  )
}

export default Recommended
