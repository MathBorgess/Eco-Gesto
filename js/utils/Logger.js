/**
 * Logger - Sistema de logging estruturado
 * @module utils/Logger
 */

class Logger {
  constructor(context = 'App', config = {}) {
    this.context = context;
    this.level = config.logLevel || 'info';
    this.enabled = config.enabled !== false;

    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    this.metrics = {
      logs: [],
      errors: [],
      warnings: [],
    };
  }

  /**
   * Log de debug
   */
  debug(message, data = null) {
    this._log('debug', message, data);
  }

  /**
   * Log de informação
   */
  info(message, data = null) {
    this._log('info', message, data);
  }

  /**
   * Log de warning
   */
  warn(message, data = null) {
    this._log('warn', message, data);
    this.metrics.warnings.push({ message, data, timestamp: Date.now() });
  }

  /**
   * Log de erro
   */
  error(message, error = null) {
    this._log('error', message, error);
    this.metrics.errors.push({ message, error, timestamp: Date.now() });
  }

  /**
   * Log interno
   */
  _log(level, message, data) {
    if (!this.enabled) return;
    if (this.levels[level] < this.levels[this.level]) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;

    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      data,
    };

    this.metrics.logs.push(logEntry);

    // Keep only last 100 logs
    if (this.metrics.logs.length > 100) {
      this.metrics.logs.shift();
    }

    switch (level) {
      case 'debug':
        console.debug(prefix, message, data || '');
        break;
      case 'info':
        console.log(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'error':
        console.error(prefix, message, data || '');
        break;
    }
  }

  /**
   * Obtém métricas de logging
   */
  getMetrics() {
    return {
      totalLogs: this.metrics.logs.length,
      errors: this.metrics.errors.length,
      warnings: this.metrics.warnings.length,
      recentErrors: this.metrics.errors.slice(-5),
      recentWarnings: this.metrics.warnings.slice(-5),
    };
  }

  /**
   * Limpa métricas
   */
  clearMetrics() {
    this.metrics = {
      logs: [],
      errors: [],
      warnings: [],
    };
  }

  /**
   * Cria um child logger com contexto específico
   */
  child(childContext) {
    return new Logger(`${this.context}:${childContext}`, {
      logLevel: this.level,
      enabled: this.enabled,
    });
  }
}

export default Logger;
