import { NextRequest, NextResponse } from 'next/server'
import { parse } from 'csv-parse/sync'
import { normalizeCategories } from '@/lib/mapping-normalizer'
import { resolveCategory, type CategoriesMapping } from '@/lib/category-resolver'
import { convertCity } from '@/lib/converters/city-converter'
import { convertPko } from '@/lib/converters/pko-converter'
import { convertNest } from '@/lib/converters/nest-converter'
import { convertSantander } from '@/lib/converters/santander-converter'
import { convertPekao } from '@/lib/converters/pekao-converter'
import { convertMonobank } from '@/lib/converters/monobank-converter'
import { convertVelobank } from '@/lib/converters/velobank-converter'
import { convertRevolut } from '@/lib/converters/revolut-converter'

type ConverterFunction = (input: Buffer, categoriesMapping?: CategoriesMapping) => string

const converters: Record<string, ConverterFunction> = {
  city: convertCity,
  pko: convertPko,
  nest: convertNest,
  santander: convertSantander,
  pekao: convertPekao,
  monobank: convertMonobank,
  velobank: convertVelobank,
  revolut: convertRevolut,
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bank = (formData.get('bank') as string) || 'city'
    const categoriesMapping = formData.get('categoriesMapping') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file was uploaded.' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    let categories: CategoriesMapping = {}
    if (categoriesMapping) {
      const categoriesMappingContent = await categoriesMapping.text()
      const normalizedCategories = normalizeCategories(JSON.parse(categoriesMappingContent))
      categories = normalizedCategories || {}
    }

    const converter = converters[bank] || convertCity
    const convertedData = converter(buffer, categories)

    return new NextResponse(convertedData, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${file.name.slice(0, -4)}-converted.csv"`,
      },
    })
  } catch (error) {
    console.error('Conversion error:', error)
    return NextResponse.json(
      { error: `Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
