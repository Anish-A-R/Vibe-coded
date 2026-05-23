'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Puzzle, Search, Download, Trash2, ToggleLeft, ToggleRight,
  Code, FileText, GitBranch, Globe, BarChart3, ShieldAlert,
  Paintbrush, Workflow, Database, Activity, Package, Filter,
  CheckCircle, XCircle
} from 'lucide-react'
import { useJarvisStore, type Plugin } from '@/hooks/useJarvisStore'
import { playActivationSound, playDeactivationSound } from '@/lib/sounds'

interface PluginStoreProps {
  windowId?: string
}

const pluginIconMap: Record<string, React.ElementType> = {
  Code,
  FileText,
  GitBranch,
  Globe,
  BarChart3,
  ShieldAlert,
  Paintbrush,
  Workflow,
  Database,
  Activity,
}

const categoryColors: Record<string, string> = {
  productivity: '#00ff88',
  developer: '#00f0ff',
  creative: '#ff6b35',
  system: '#ff3366',
  data: '#8b5cf6',
}

type FilterTab = 'all' | 'installed' | 'available'

export function PluginStore({ windowId }: PluginStoreProps) {
  const { plugins, togglePlugin, installPlugin, uninstallPlugin, soundEnabled, addNotification } = useJarvisStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  // Filtered plugins
  const filteredPlugins = useMemo(() => {
    let result = plugins

    if (activeTab === 'installed') {
      result = result.filter(p => p.installed)
    } else if (activeTab === 'available') {
      result = result.filter(p => !p.installed)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      )
    }

    return result
  }, [plugins, activeTab, searchQuery])

  // Stats
  const installedCount = plugins.filter(p => p.installed).length
  const enabledCount = plugins.filter(p => p.enabled).length
  const availableCount = plugins.filter(p => !p.installed).length

  const handleInstall = (plugin: Plugin) => {
    installPlugin(plugin.id)
    if (soundEnabled) playActivationSound()
    addNotification({
      type: 'success',
      title: 'Plugin Installed',
      message: `${plugin.name} v${plugin.version} has been installed`,
    })
  }

  const handleUninstall = (plugin: Plugin) => {
    uninstallPlugin(plugin.id)
    if (soundEnabled) playDeactivationSound()
    addNotification({
      type: 'info',
      title: 'Plugin Removed',
      message: `${plugin.name} has been uninstalled`,
    })
  }

  const handleToggle = (plugin: Plugin) => {
    togglePlugin(plugin.id)
    if (soundEnabled) playActivationSound()
    addNotification({
      type: plugin.enabled ? 'info' : 'success',
      title: plugin.enabled ? 'Plugin Disabled' : 'Plugin Enabled',
      message: `${plugin.name} has been ${plugin.enabled ? 'disabled' : 'enabled'}`,
    })
  }

  const tabCounts = {
    all: plugins.length,
    installed: installedCount,
    available: availableCount,
  }

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden relative">
      {/* Animated gradient border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden">
        <motion.div
          className="h-full w-[200%]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,204,0,0.6), rgba(0,240,255,0.4), transparent, rgba(255,204,0,0.6), transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neon-orange/10">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-neon-orange"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h2 className="text-sm font-mono text-neon-orange/80 uppercase tracking-wider">
            Plugins
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-neon-green/5 border border-neon-green/10">
            <Package className="w-3 h-3 text-neon-green/60" />
            <span className="text-[10px] font-mono text-neon-green/60">{installedCount}/{plugins.length}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-neon-orange/5 border border-neon-orange/10">
            <CheckCircle className="w-3 h-3 text-neon-orange/60" />
            <span className="text-[10px] font-mono text-neon-orange/60">{enabledCount} on</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-3 py-2 border-b border-white/5 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search plugins..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/5
              text-[11px] text-white/70 placeholder:text-white/20 font-mono
              focus:outline-none focus:border-neon-orange/30 focus:bg-white/[0.07]
              transition-all duration-200"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1">
          {(['all', 'installed', 'available'] as FilterTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-mono uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-neon-orange/10 border border-neon-orange/20 text-neon-orange/70'
                  : 'bg-white/[0.02] border border-white/5 text-white/30 hover:text-white/50 hover:bg-white/5'
              }`}
            >
              <span>{tab}</span>
              <span className="opacity-50">({tabCounts[tab]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Plugin Grid */}
      <div className="flex-1 overflow-y-auto jarvis-scrollbar p-3">
        {filteredPlugins.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Puzzle className="w-10 h-10 text-neon-orange/20" />
            <p className="text-xs font-mono text-white/20">No plugins found</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredPlugins.map((plugin, index) => {
                const PluginIcon = pluginIconMap[plugin.icon] || Puzzle
                const catColor = categoryColors[plugin.category] || '#64748b'

                return (
                  <motion.div
                    key={plugin.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="group rounded-xl p-3 bg-white/[0.02] border border-white/5 hover:border-neon-orange/15 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center border flex-shrink-0"
                        style={{ backgroundColor: `${catColor}10`, borderColor: `${catColor}25` }}
                      >
                        <PluginIcon className="w-4 h-4" style={{ color: catColor }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-mono font-semibold text-white/70 truncate">
                            {plugin.name}
                          </span>
                          <span className="text-[8px] font-mono text-white/20">v{plugin.version}</span>
                          <span
                            className="text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{ color: catColor, backgroundColor: `${catColor}10` }}
                          >
                            {plugin.category}
                          </span>
                        </div>
                        <p className="text-[9px] font-mono text-white/30 leading-relaxed line-clamp-2">
                          {plugin.description}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2">
                          {plugin.installed ? (
                            <>
                              {/* Enable/Disable toggle */}
                              <button
                                onClick={() => handleToggle(plugin)}
                                className="flex items-center gap-1.5"
                              >
                                {plugin.enabled ? (
                                  <div className="flex items-center gap-1">
                                    <ToggleRight className="w-4 h-4 text-neon-green/60" />
                                    <span className="text-[9px] font-mono text-neon-green/60">ON</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <ToggleLeft className="w-4 h-4 text-white/25" />
                                    <span className="text-[9px] font-mono text-white/25">OFF</span>
                                  </div>
                                )}
                              </button>

                              {/* Installed badge */}
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-neon-green/5 border border-neon-green/10">
                                <CheckCircle className="w-2.5 h-2.5 text-neon-green/50" />
                                <span className="text-[8px] font-mono text-neon-green/50">Installed</span>
                              </div>

                              {/* Uninstall button */}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUninstall(plugin)}
                                className="ml-auto flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono text-white/20
                                  hover:text-neon-red/60 hover:bg-neon-red/5 transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </motion.button>
                            </>
                          ) : (
                            <>
                              {/* Not installed badge */}
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                                <XCircle className="w-2.5 h-2.5 text-white/20" />
                                <span className="text-[8px] font-mono text-white/20">Not installed</span>
                              </div>

                              {/* Install button */}
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleInstall(plugin)}
                                className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-md
                                  bg-neon-orange/10 border border-neon-orange/20
                                  text-[9px] font-mono uppercase tracking-wider text-neon-orange/70
                                  hover:bg-neon-orange/15 hover:text-neon-orange transition-all"
                              >
                                <Download className="w-3 h-3" />
                                <span>Install</span>
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-neon-orange/10">
        <span className="text-[9px] font-mono text-white/20">
          {enabledCount} plugins active
        </span>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-neon-orange/40"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="text-[9px] font-mono text-white/20 uppercase">Store Online</span>
        </div>
      </div>
    </div>
  )
}
