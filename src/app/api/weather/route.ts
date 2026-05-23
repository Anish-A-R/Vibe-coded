import { NextResponse } from 'next/server'

/**
 * Simulated weather endpoint
 * In production, this would call a real weather API
 */
export async function GET() {
  // Simulate weather data with some variation
  const conditions = ['Clear Sky', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Sunny', 'Overcast']
  const condition = conditions[Math.floor(Math.random() * conditions.length)]

  const baseTemp = 22
  const tempVariation = Math.sin(Date.now() / 86400000) * 8 + (Math.random() * 4 - 2)

  const weather = {
    temp: Math.round(baseTemp + tempVariation),
    condition,
    humidity: Math.round(55 + Math.random() * 25),
    wind: Math.round(8 + Math.random() * 15),
    location: 'Stark Tower',
    forecast: [
      { day: 'Today', high: Math.round(baseTemp + tempVariation + 3), low: Math.round(baseTemp + tempVariation - 5), condition },
      { day: 'Tomorrow', high: Math.round(baseTemp + tempVariation + 5), low: Math.round(baseTemp + tempVariation - 3), condition: conditions[Math.floor(Math.random() * conditions.length)] },
      { day: 'Day 3', high: Math.round(baseTemp + tempVariation + 2), low: Math.round(baseTemp + tempVariation - 4), condition: conditions[Math.floor(Math.random() * conditions.length)] },
    ],
    updated: new Date().toISOString(),
  }

  return NextResponse.json(weather)
}
