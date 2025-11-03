/**
 * EvolutionEngine - Módulo de Sistema Evolutivo
 * Implementa algoritmos genéticos para cruzamento e mutação de criaturas sonoras
 */

export default class EvolutionEngine {
  constructor() {
    this.generationCounter = 0;
  }

  /**
   * Seleciona pais para cruzamento
   * Estratégia: selecionar criaturas mais recentes e energéticas
   */
  selectParents(creatures) {
    if (creatures.length < 2) {
      return [];
    }

    // Ordenar por "fitness" (combinação de tempo de vida e características)
    const sorted = [...creatures].sort((a, b) => {
      const fitnessA = this.calculateFitness(a);
      const fitnessB = this.calculateFitness(b);
      return fitnessB - fitnessA;
    });

    // Retornar os dois melhores
    return [sorted[0], sorted[1]];
  }

  /**
   * Calcula fitness de uma criatura
   * Criaturas mais recentes e com características interessantes têm maior fitness
   */
  calculateFitness(creature) {
    const age = Date.now() - creature.birthTime;
    const ageFactor = 1 / (1 + age / 10000); // Favorece criaturas mais jovens

    // Características interessantes: volumes médios, frequências variadas
    const volumeFactor = 1 - Math.abs(creature.dna.volume - 0.35);
    const frequencyVariety = Math.abs(creature.dna.frequency - 500) / 500;

    return ageFactor * 0.5 + volumeFactor * 0.3 + frequencyVariety * 0.2;
  }

  /**
   * Realiza cruzamento entre duas criaturas
   * Cria um híbrido com características dos pais + influência do gesto atual
   */
  crossover(parent1, parent2, currentGesture, mutationRate) {
    console.log(`🧬 Cruzando ${parent1.name} × ${parent2.name}`);

    // DNA do filho será uma mistura dos pais
    const offspringDNA = {};

    // Para cada parâmetro do DNA, escolher aleatoriamente de um dos pais
    // e aplicar pequenas mutações
    const dnaKeys = Object.keys(parent1.dna);

    dnaKeys.forEach((key) => {
      if (key === "envelope") {
        // Envelope é objeto, tratar separadamente
        offspringDNA.envelope = this.crossoverEnvelope(
          parent1.dna.envelope,
          parent2.dna.envelope,
          mutationRate
        );
      } else if (key === "waveType") {
        // WaveType: escolher de um dos pais
        offspringDNA.waveType =
          Math.random() < 0.5 ? parent1.dna.waveType : parent2.dna.waveType;

        // Pequena chance de mutação total
        if (Math.random() < mutationRate * 0.5) {
          const waveTypes = ["sine", "triangle", "sawtooth", "square"];
          offspringDNA.waveType =
            waveTypes[Math.floor(Math.random() * waveTypes.length)];
        }
      } else {
        // Valores numéricos: média ponderada + mutação
        const parentValue =
          Math.random() < 0.5 ? parent1.dna[key] : parent2.dna[key];

        offspringDNA[key] = this.mutate(parentValue, mutationRate);
      }
    });

    // Influência do gesto atual (10-20% do DNA)
    const gestureInfluence = 0.15;
    if (currentGesture && currentGesture.features) {
      const { features } = currentGesture;

      // Ajustar alguns parâmetros baseado no gesto
      offspringDNA.frequency = this.blend(
        offspringDNA.frequency,
        this.mapRange(features.position.y, 0, 1, 800, 200),
        gestureInfluence
      );

      offspringDNA.lfoRate = this.blend(
        offspringDNA.lfoRate,
        this.mapRange(features.velocity, 0, 0.1, 0.5, 8),
        gestureInfluence
      );

      offspringDNA.pan = this.blend(
        offspringDNA.pan,
        this.mapRange(features.position.x, 0, 1, -1, 1),
        gestureInfluence
      );
    }

    // Criar criatura híbrida
    const offspring = {
      id: `hybrid_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: this.generateHybridName(parent1, parent2),
      type: "hybrid",
      dna: offspringDNA,
      birthTime: Date.now(),
      generation: Math.max(parent1.generation, parent2.generation) + 1,
      parents: [parent1.id, parent2.id],
      gestureOrigin: currentGesture ? currentGesture.features : null,
    };

    console.log(
      `✨ Híbrido ${offspring.name} nasceu (Gen ${offspring.generation})`
    );

    return offspring;
  }

  /**
   * Cruza envelopes ADSR de dois pais
   */
  crossoverEnvelope(env1, env2, mutationRate) {
    return {
      attack: this.mutate(
        Math.random() < 0.5 ? env1.attack : env2.attack,
        mutationRate
      ),
      decay: this.mutate(
        Math.random() < 0.5 ? env1.decay : env2.decay,
        mutationRate
      ),
      sustain: this.mutate(
        Math.random() < 0.5 ? env1.sustain : env2.sustain,
        mutationRate
      ),
      release: this.mutate(
        Math.random() < 0.5 ? env1.release : env2.release,
        mutationRate
      ),
    };
  }

  /**
   * Aplica mutação a um valor
   * Adiciona variação aleatória proporcional à taxa de mutação
   */
  mutate(value, mutationRate) {
    // Validar entrada
    if (!isFinite(value) || isNaN(value)) {
      console.warn(`⚠️ Valor inválido em mutate: ${value}, retornando 0`);
      return 0;
    }

    if (Math.random() > mutationRate) {
      return value; // Sem mutação
    }

    // Mutação: +/- até 20% do valor
    const mutationAmount = value * (Math.random() * 0.4 - 0.2);
    const mutated = value + mutationAmount;

    // Garantir valores razoáveis (evitar negativos em parâmetros que não aceitam)
    if (value >= 0 && mutated < 0) {
      return value * 0.1; // Valor mínimo
    }

    // Validar saída
    if (!isFinite(mutated) || isNaN(mutated)) {
      console.warn(
        `⚠️ Mutação gerou valor inválido, retornando original: ${value}`
      );
      return value;
    }

    return mutated;
  }

  /**
   * Mistura dois valores com peso específico
   */
  blend(value1, value2, weight) {
    // Validar entradas
    if (!isFinite(value1) || isNaN(value1)) {
      console.warn(`⚠️ value1 inválido em blend: ${value1}, usando value2`);
      return value2;
    }
    if (!isFinite(value2) || isNaN(value2)) {
      console.warn(`⚠️ value2 inválido em blend: ${value2}, usando value1`);
      return value1;
    }
    if (!isFinite(weight) || isNaN(weight)) {
      console.warn(`⚠️ weight inválido em blend: ${weight}, usando 0.5`);
      weight = 0.5;
    }

    const result = value1 * (1 - weight) + value2 * weight;

    // Validar saída
    if (!isFinite(result) || isNaN(result)) {
      console.warn(
        `⚠️ Blend gerou valor inválido, retornando value1: ${value1}`
      );
      return value1;
    }

    return result;
  }

  /**
   * Mapeia valor de um range para outro
   */
  mapRange(value, inMin, inMax, outMin, outMax) {
    // Validar entrada
    if (!isFinite(value) || isNaN(value)) {
      console.warn(`⚠️ Valor inválido em mapRange: ${value}, usando inMin`);
      value = inMin;
    }

    const clamped = Math.max(inMin, Math.min(inMax, value));
    const result =
      ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;

    // Validar saída
    if (!isFinite(result) || isNaN(result)) {
      console.warn(
        `⚠️ mapRange gerou valor inválido, retornando outMin: ${outMin}`
      );
      return outMin;
    }

    return result;
  }

  /**
   * Gera nome para criatura híbrida
   */
  generateHybridName(parent1, parent2) {
    // Pegar partes dos nomes dos pais
    const name1Parts = parent1.name.split("-");
    const name2Parts = parent2.name.split("-");

    // Combinar prefixos
    const prefix1 = name1Parts[0];
    const prefix2 = name2Parts[0];

    // Criar portmanteau (ex: Ignis + Nimbus = Ignibus)
    let hybridPrefix;
    if (prefix1.length >= 3 && prefix2.length >= 3) {
      hybridPrefix =
        prefix1.substring(0, Math.ceil(prefix1.length / 2)) +
        prefix2.substring(Math.floor(prefix2.length / 2));
    } else {
      hybridPrefix = prefix1.charAt(0) + prefix2;
    }

    const suffix = Math.floor(Math.random() * 1000);

    return `${hybridPrefix}-${suffix}`;
  }

  /**
   * Seleção natural: remove criaturas menos aptas
   * (não usado diretamente, mas pode ser expandido)
   */
  selectForSurvival(creatures, maxPopulation) {
    if (creatures.length <= maxPopulation) {
      return creatures;
    }

    // Ordenar por fitness
    const sorted = [...creatures].sort((a, b) => {
      return this.calculateFitness(b) - this.calculateFitness(a);
    });

    // Manter apenas os mais aptos
    return sorted.slice(0, maxPopulation);
  }
}
