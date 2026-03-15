'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const BANKS = [
  { value: 'city', label: 'Citi' },
  { value: 'pko', label: 'PKO' },
  { value: 'nest', label: 'Nest' },
  { value: 'santander', label: 'Santander' },
  { value: 'pekao', label: 'Pekao' },
  { value: 'monobank', label: 'Monobank' },
  { value: 'velobank', label: 'Velobank' },
  { value: 'revolut', label: 'Revolut' },
]

export default function Home() {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [categoriesFile, setCategoriesFile] = useState<File | null>(null)
  const [selectedBank, setSelectedBank] = useState('city')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCsvFile(file)
      setError(null)
    }
  }

  const handleCategoriesFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCategoriesFile(file)
    }
  }

  const handleConvert = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!csvFile) {
      setError('Please select a CSV file to convert')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', csvFile)
      formData.append('bank', selectedBank)

      if (categoriesFile) {
        formData.append('categoriesMapping', categoriesFile)
      }

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to convert file')
      }

      // Get the filename from the response headers or use a default
      const filename = csvFile.name.replace(/\.[^.]+$/, '') + '-converted.csv'

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Reset form
      setCsvFile(null)
      setCategoriesFile(null)
      if (document.querySelector('input[type="file"][accept=".csv"]')) {
        (document.querySelector('input[type="file"][accept=".csv"]') as HTMLInputElement).value = ''
      }
      if (document.querySelector('input[type="file"][accept=".json"]')) {
        (document.querySelector('input[type="file"][accept=".json"]') as HTMLInputElement).value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during conversion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">ToExpenseManager Converter</h1>
          <p className="text-muted-foreground">
            Convert your bank CSV statements into a format compatible with Expense Manager. Simple, fast, and secure.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Convert Your Bank Statement</CardTitle>
            <CardDescription>Upload your CSV file and select your bank to convert</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConvert} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="csv-file" className="text-base font-medium">
                  Choose CSV file to convert <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="csv-file"
                    name="file"
                    accept=".csv"
                    onChange={handleCsvFileChange}
                    required
                    className="block w-full text-sm text-foreground file:mr-4 file:rounded file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                {csvFile && (
                  <p className="text-sm text-green-600">
                    ✓ {csvFile.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categories-file" className="text-base font-medium">
                  Choose JSON file with categories mapping (optional)
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="categories-file"
                    name="categoriesMapping"
                    accept=".json"
                    onChange={handleCategoriesFileChange}
                    className="block w-full text-sm text-foreground file:mr-4 file:rounded file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                {categoriesFile && (
                  <p className="text-sm text-green-600">
                    ✓ {categoriesFile.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-select" className="text-base font-medium">
                  Select Bank
                </Label>
                <Select value={selectedBank} onValueChange={setSelectedBank}>
                  <SelectTrigger id="bank-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BANKS.map((bank) => (
                      <SelectItem key={bank.value} value={bank.value}>
                        {bank.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !csvFile}
                className="w-full"
              >
                {isLoading ? 'Converting...' : 'Convert & Download'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
