'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, Droplets, Wind, MapPin, Thermometer, Sun, CloudRain, CloudSun, RefreshCw } from 'lucide-react'
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
  feelsLike?: number
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

/* Animated weather condition icon */
function AnimatedWeatherIcon({ condition }: { condition: string }) {
  const lower = condition.toLowerCase()

  if (lower.includes('rain')) {
    return (
      <div className="relative w-8 h-8 flex items-center justify-center">
        <Cloud className="size-5 text-blue-400/80" />
        {/* Animated rain drops */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-1.5 bg-blue-400/60 rounded-full"
            style={{ left: `${8 + i * 6}px`, top: '18px' }}
            animate={{ y: [0, 8, 0], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.25, ease: 'easeIn' }}
          />
        ))}
      </div>
    )
  }

  if (lower.includes('sunny') || lower.includes('clear')) {
    return (
      <div className="relative w-8 h-8 flex items-center justify-center">
        <Sun className="size-5 text-amber-400" />
        {/* Animated sun rays */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute w-[1px] h-1.5 bg-amber-400/40"
            style={{
              top: '0px',
              left: '50%',
              transformOrigin: '50% 16px',
              transform: `rotate(${i * 60}deg)`,
            }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>
    )
  }

  if (lower.includes('partly')) {
    return (
      <div className="relative w-8 h-8 flex items-center justify-center">
        <CloudSun className="size-5 text-amber-300" />
      </div>
    )
  }

  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      {getWeatherIcon(condition)}
    </div>
  )
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
  const [refreshing, setRefreshing] = useState(false)
  const refreshRef = useRef<HTMLButtonElement>(null)

  const fetchWeather = useCallback(async () => {
    try {
      setError(false)
      setRefreshing(true)
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
      // Keep refreshing state for a moment for animation
      setTimeout(() => setRefreshing(false), 600)
    } catch {
      setError(true)
      setLoading(false)
      setRefreshing(false)
    }
  }, [setWeather])

  useEffect(() => {
    fetchWeather()
    const interval = setInterval(fetchWeather, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchWeather])

  const handleRefresh = () => {
    fetchWeather()
  }

  // Feels like temperature (simulated slightly different)
  const feelsLike = weather ? weather.temp + (weather.wind > 10 ? -2 : weather.humidity > 70 ? 2 : 0) : 0
  // Thermometer fill: 0°C = 0%, 40°C = 100%
  const thermoFill = weather ? Math.min(100, Math.max(0, ((feelsLike + 10) / 50) * 100)) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden rounded-xl border border-orange-500/20 bg-black/40 backdrop-blur-xl holo-border-orange inner-glow-orange"
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-orange-500/40 z-[2]" />
      <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-orange-500/40 z-[2]" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-orange-500/40 z-[2]" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-orange-500/40 z-[2]" />

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="p-4 text-center text-orange-400/50 text-xs font-mono relative z-[2]">
          Weather data unavailable
        </div>
      ) : weather ? (
        <div className="p-4 relative z-[2]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-orange-400/60 text-xs font-mono">
              <MapPin className="size-3" />
              {weather.location}
            </div>
            <div className="flex items-center gap-2">
              <AnimatedWeatherIcon condition={weather.condition} />
              {/* Refresh button */}
              <button
                ref={refreshRef}
                onClick={handleRefresh}
                className="p-1 rounded-md hover:bg-orange-500/10 transition-colors"
                aria-label="Refresh weather"
                title="Refresh weather data"
              >
                <RefreshCw
                  className={`size-3 text-orange-400/40 hover:text-orange-400/70 transition-colors ${refreshing ? 'animate-refresh-spin' : ''}`}
                />
              </button>
            </div>
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

          {/* Feels Like with thermometer */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-orange-400/50">
              <Thermometer className="size-3" />
              <span>Feels {feelsLike}°</span>
            </div>
            {/* Mini thermometer bar */}
            <div className="flex-1 h-1.5 rounded-full bg-orange-900/20 overflow-hidden max-w-[60px]">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, rgba(0, 136, 255, 0.6), rgba(255, 106, 0, 0.6), rgba(255, 51, 102, 0.6))',
                }}
                animate={{ width: `${thermoFill}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
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
          </div>

          {/* Mini forecast - glassmorphic cards */}
          {forecast.length > 0 && (
            <div className="border-t border-orange-500/10 pt-2">
              <div className="grid grid-cols-3 gap-2">
                {forecast.map((day, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 106, 0, 0.08)' }}
                    className="text-center rounded-lg p-1.5 transition-colors duration-200"
                    style={{
                      background: 'rgba(255, 106, 0, 0.03)',
                      border: '1px solid rgba(255, 106, 0, 0.08)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <div className="text-[10px] text-orange-400/40 font-mono">{day.day}</div>
                    <div className="text-xs my-0.5">{getWeatherEmoji(day.condition)}</div>
                    <div className="text-[10px] font-mono">
                      <span className="text-orange-400/70">{day.high}°</span>
                      <span className="text-orange-400/30 mx-0.5">/</span>
                      <span className="text-orange-400/40">{day.low}°</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </motion.div>
  )
}
