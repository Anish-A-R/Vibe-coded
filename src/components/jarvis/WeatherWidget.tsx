'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, Droplets, Wind, MapPin, Thermometer, Sun, CloudRain, CloudSun } from 'lucide-react'
import { useJarvisStore } from '@/hooks/useJarvisStore'

interface ForecastDay {
  day: string
  high: number
  low: number
  condition: string
}

interface WeatherResponse {
  temp: number
  condition: string
  humidity: number
  wind: number
  location: string
  forecast: ForecastDay[]
  updated: string
}

function getWeatherIcon(condition: string) {
  const lower = condition.toLowerCase()
  if (lower.includes('sunny') || lower.includes('clear')) return <Sun className="size-5 text-amber-400" />
  if (lower.includes('rain')) return <CloudRain className="size-5 text-blue-400" />
  if (lower.includes('cloud') || lower.includes('overcast')) return <Cloud className="size-5 text-gray-400" />
  if (lower.includes('partly')) return <CloudSun className="size-5 text-amber-300" />
  return <Sun className="size-5 text-amber-400" />
}

function getWeatherEmoji(condition: string): string {
  const lower = condition.toLowerCase()
  if (lower.includes('sunny') || lower.includes('clear')) return '☀️'
  if (lower.includes('rain')) return '🌧️'
  if (lower.includes('cloud') || lower.includes('overcast')) return '☁️'
  if (lower.includes('partly')) return '⛅'
  if (lower.includes('snow')) return '❄️'
  if (lower.includes('storm') || lower.includes('thunder')) return '⛈️'
  return '🌤️'
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-20 rounded bg-orange-500/10" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-16 rounded bg-orange-500/10" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-orange-500/10" />
          <div className="h-3 w-16 rounded bg-orange-500/10" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-3 w-14 rounded bg-orange-500/10" />
        <div className="h-3 w-14 rounded bg-orange-500/10" />
      </div>
    </div>
  )
}

export default function WeatherWidget() {
  const { weather, setWeather } = useJarvisStore()
  const [loading, setLoading] = useState(!weather)
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [error, setError] = useState(false)

  const fetchWeather = useCallback(async () => {
    try {
      setError(false)
      const res = await fetch('/api/weather')
      if (!res.ok) throw new Error('Weather API error')
      const data: WeatherResponse = await res.json()
      setWeather({
        temp: data.temp,
        condition: data.condition,
        humidity: data.humidity,
        wind: data.wind,
        location: data.location,
      })
      setForecast(data.forecast || [])
      setLoading(false)
    } catch {
      setError(true)
      setLoading(false)
    }
  }, [setWeather])

  useEffect(() => {
    fetchWeather()
    const interval = setInterval(fetchWeather, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchWeather])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden rounded-xl border border-orange-500/20 bg-black/40 backdrop-blur-xl"
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-orange-500/40" />
      <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-orange-500/40" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-orange-500/40" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-orange-500/40" />

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="p-4 text-center text-orange-400/50 text-xs font-mono">
          Weather data unavailable
        </div>
      ) : weather ? (
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-orange-400/60 text-xs font-mono">
              <MapPin className="size-3" />
              {weather.location}
            </div>
            {getWeatherIcon(weather.condition)}
          </div>

          {/* Temperature & Condition */}
          <div className="flex items-baseline gap-2 mb-3">
            <motion.span
              key={weather.temp}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-mono font-bold text-orange-400"
              style={{ textShadow: '0 0 10px rgba(255, 106, 0, 0.3)' }}
            >
              {weather.temp}°C
            </motion.span>
            <span className="text-xs text-orange-300/50 font-mono">
              {getWeatherEmoji(weather.condition)} {weather.condition}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mb-3 text-xs font-mono">
            <div className="flex items-center gap-1 text-orange-400/50">
              <Droplets className="size-3" />
              <span>{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1 text-orange-400/50">
              <Wind className="size-3" />
              <span>{weather.wind} km/h</span>
            </div>
            <div className="flex items-center gap-1 text-orange-400/50">
              <Thermometer className="size-3" />
              <span>Feels {weather.temp - 1}°</span>
            </div>
          </div>

          {/* Mini forecast */}
          {forecast.length > 0 && (
            <div className="border-t border-orange-500/10 pt-2">
              <div className="grid grid-cols-3 gap-2">
                {forecast.map((day, i) => (
                  <div key={i} className="text-center">
                    <div className="text-[10px] text-orange-400/40 font-mono">{day.day}</div>
                    <div className="text-xs my-0.5">{getWeatherEmoji(day.condition)}</div>
                    <div className="text-[10px] font-mono">
                      <span className="text-orange-400/70">{day.high}°</span>
                      <span className="text-orange-400/30 mx-0.5">/</span>
                      <span className="text-orange-400/40">{day.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </motion.div>
  )
}
