import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import FileUpload from './FileUpload'

describe('FileUpload Component', () => {
  test('renders button with default label', () => {
    const mockOnFileSelect = jest.fn()
    render(<FileUpload onFileSelect={mockOnFileSelect} />)
    expect(screen.getByText('Upload File')).toBeInTheDocument()
  })

  test('renders button with custom label', () => {
    const mockOnFileSelect = jest.fn()
    render(<FileUpload onFileSelect={mockOnFileSelect} label="Choose File" />)
    expect(screen.getByText('Choose File')).toBeInTheDocument()
  })

  test('calls onFileSelect when file is selected', () => {
    const mockOnFileSelect = jest.fn()
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    
    render(<FileUpload onFileSelect={mockOnFileSelect} />)
    
    const input = screen.getByRole('button').parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeInTheDocument()
    
    fireEvent.change(input, { target: { files: [file] } })
    
    expect(mockOnFileSelect).toHaveBeenCalledTimes(1)
    expect(mockOnFileSelect).toHaveBeenCalledWith(file)
  })

  test('does not call onFileSelect when no file is selected', () => {
    const mockOnFileSelect = jest.fn()
    
    render(<FileUpload onFileSelect={mockOnFileSelect} />)
    
    const input = screen.getByRole('button').parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: null } })
    
    expect(mockOnFileSelect).not.toHaveBeenCalled()
  })

  test('applies accept attribute to input', () => {
    const mockOnFileSelect = jest.fn()
    render(<FileUpload onFileSelect={mockOnFileSelect} accept="image/*" />)
    
    const input = screen.getByRole('button').parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toHaveAttribute('accept', 'image/*')
  })

  test('uses default accept attribute when not provided', () => {
    const mockOnFileSelect = jest.fn()
    render(<FileUpload onFileSelect={mockOnFileSelect} />)
    
    const input = screen.getByRole('button').parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toHaveAttribute('accept', '*/*')
  })

  test('disables button when disabled prop is true', () => {
    const mockOnFileSelect = jest.fn()
    render(<FileUpload onFileSelect={mockOnFileSelect} disabled />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  test('disables input when disabled prop is true', () => {
    const mockOnFileSelect = jest.fn()
    render(<FileUpload onFileSelect={mockOnFileSelect} disabled />)
    
    const input = screen.getByRole('button').parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeDisabled()
  })

  test('opens file dialog when button is clicked', () => {
    const mockOnFileSelect = jest.fn()
    render(<FileUpload onFileSelect={mockOnFileSelect} />)
    
    const button = screen.getByRole('button')
    const input = screen.getByRole('button').parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    
    const clickSpy = jest.spyOn(input, 'click')
    
    fireEvent.click(button)
    
    expect(clickSpy).toHaveBeenCalledTimes(1)
    
    clickSpy.mockRestore()
  })

  test('input has hidden attribute', () => {
    const mockOnFileSelect = jest.fn()
    render(<FileUpload onFileSelect={mockOnFileSelect} />)
    
    const input = screen.getByRole('button').parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toHaveAttribute('hidden')
  })

  test('handles multiple file selections correctly', () => {
    const mockOnFileSelect = jest.fn()
    const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' })
    const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' })
    
    render(<FileUpload onFileSelect={mockOnFileSelect} />)
    
    const input = screen.getByRole('button').parentElement?.querySelector('input[type="file"]') as HTMLInputElement
    
    // First file selection
    fireEvent.change(input, { target: { files: [file1] } })
    expect(mockOnFileSelect).toHaveBeenCalledWith(file1)
    
    // Second file selection (should only call with the first file)
    fireEvent.change(input, { target: { files: [file2] } })
    expect(mockOnFileSelect).toHaveBeenCalledWith(file2)
    expect(mockOnFileSelect).toHaveBeenCalledTimes(2)
  })
})
