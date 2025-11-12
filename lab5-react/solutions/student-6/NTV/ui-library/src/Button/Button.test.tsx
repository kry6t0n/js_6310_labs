import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import Button from './Button'

describe('Button Component', () => {
  test('renders button with children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  test('renders with primary variant by default', () => {
    render(<Button>Primary</Button>)
    const button = screen.getByText('Primary')
    expect(button).toHaveClass('btn-primary')
  })

  test('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByText('Secondary')
    expect(button).toHaveClass('btn-secondary')
  })

  test('renders with text variant', () => {
    render(<Button variant="text">Text</Button>)
    const button = screen.getByText('Text')
    expect(button).toHaveClass('btn-text')
  })

  test('calls onClick handler when clicked', () => {
    const mockClickHandler = jest.fn()
    render(<Button onClick={mockClickHandler}>Click</Button>)
    const button = screen.getByText('Click')
    fireEvent.click(button)
    expect(mockClickHandler).toHaveBeenCalledTimes(1)
  })

  test('does not call onClick when disabled', () => {
    const mockClickHandler = jest.fn()
    render(
      <Button onClick={mockClickHandler} disabled>
        Disabled
      </Button>,
    )
    const button = screen.getByText('Disabled')
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(mockClickHandler).not.toHaveBeenCalled()
  })

  test('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByText('Custom')
    expect(button).toHaveClass('custom-class')
  })

  test('renders with multiple children', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>,
    )
    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  test('has correct base class btn', () => {
    render(<Button>Test</Button>)
    const button = screen.getByText('Test')
    expect(button).toHaveClass('btn')
  })

  test('combines variant and custom classes', () => {
    render(
      <Button variant="secondary" className="extra">
        Multi
      </Button>,
    )
    const button = screen.getByText('Multi')
    expect(button).toHaveClass('btn')
    expect(button).toHaveClass('btn-secondary')
    expect(button).toHaveClass('extra')
  })
})
