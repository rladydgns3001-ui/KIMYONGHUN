import type { z } from 'zod'

// Simple Zod to JSON Schema converter for prompts
export function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  return convertZodType(schema)
}

function convertZodType(schema: z.ZodType): Record<string, unknown> {
  const def = (schema as unknown as { _def: Record<string, unknown> })._def

  if (!def) return { type: 'object' }

  const typeName = def.typeName as string

  switch (typeName) {
    case 'ZodObject': {
      const shape = (schema as z.ZodObject<z.ZodRawShape>).shape
      const properties: Record<string, unknown> = {}
      const required: string[] = []

      for (const [key, value] of Object.entries(shape)) {
        properties[key] = convertZodType(value as z.ZodType)
        const innerDef = (value as unknown as { _def: Record<string, unknown> })._def
        if (innerDef.typeName !== 'ZodOptional') {
          required.push(key)
        }
      }

      const result: Record<string, unknown> = { type: 'object', properties }
      if (required.length > 0) result.required = required
      if (def.description) result.description = def.description
      return result
    }

    case 'ZodArray': {
      const innerType = def.type as z.ZodType
      const result: Record<string, unknown> = { type: 'array', items: convertZodType(innerType) }
      if (def.description) result.description = def.description
      return result
    }

    case 'ZodString': {
      const result: Record<string, unknown> = { type: 'string' }
      if (def.description) result.description = def.description
      return result
    }

    case 'ZodNumber': {
      const result: Record<string, unknown> = { type: 'number' }
      if (def.description) result.description = def.description
      const checks = def.checks as Array<{ kind: string; value: number }> | undefined
      if (checks) {
        for (const check of checks) {
          if (check.kind === 'min') result.minimum = check.value
          if (check.kind === 'max') result.maximum = check.value
        }
      }
      return result
    }

    case 'ZodEnum': {
      const values = def.values as string[]
      return { type: 'string', enum: values, ...(def.description ? { description: def.description } : {}) }
    }

    case 'ZodLiteral': {
      return { type: typeof def.value, const: def.value }
    }

    case 'ZodOptional': {
      const inner = convertZodType(def.innerType as z.ZodType)
      return inner
    }

    case 'ZodDefault': {
      const inner = convertZodType(def.innerType as z.ZodType)
      return { ...inner, default: def.defaultValue }
    }

    default:
      return { type: 'string' }
  }
}
