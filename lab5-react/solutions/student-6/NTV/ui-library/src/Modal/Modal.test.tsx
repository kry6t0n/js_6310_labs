import { render, screen, fireEvent } from '@testing-library/react'

import Modal from './Modal'

describe('Modal Component', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  it('should render without crashing', () => {
    const { container } = render(
      <Modal isOpen onClose={mockOnClose} title="Test Modal">
        Test content
      </Modal>
    )
    expect(container).toBeDefined()
  })

  it('should render when isOpen is true', () => {
    const { container } = render(
      <Modal isOpen onClose={mockOnClose} title="Test Modal">
        Test content
      </Modal>
    )
    const modalOverlay = container.querySelector('.modal-overlay')
    expect(modalOverlay).toBeInTheDocument()
  })

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        Test content
      </Modal>
    )
    const modalOverlay = container.querySelector('.modal-overlay')
    expect(modalOverlay).not.toBeInTheDocument()
  })

  it('should render title when provided', () => {
    render(
      <Modal isOpen onClose={mockOnClose} title="Test Modal">
        Test content
      </Modal>
    )
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
  })

  it('should not render title when not provided', () => {
    const { container } = render(
      <Modal isOpen onClose={mockOnClose}>
        Test content
      </Modal>
    )
    const modalHeader = container.querySelector('.modal-header')
    expect(modalHeader).not.toBeInTheDocument()
  })

  it('should render children content', () => {
    render(
      <Modal isOpen onClose={mockOnClose} title="Test Modal">
        <div>Test content</div>
      </Modal>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should call onClose when overlay is clicked', () => {
    const { container } = render(
      <Modal isOpen onClose={mockOnClose} title="Test Modal">
        Test content
      </Modal>
    )
    const overlay = container.querySelector('.modal-overlay')
    expect(overlay).toBeInTheDocument()
    
    fireEvent.click(overlay!)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when close button is clicked', () => {
    render(
      <Modal isOpen onClose={mockOnClose} title="Test Modal">
        Test content
      </Modal>
    )
    const closeButton = screen.getByRole('button')
    expect(closeButton).toBeInTheDocument()
    
    fireEvent.click(closeButton)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose when modal content is clicked', () => {
    const { container } = render(
      <Modal isOpen onClose={mockOnClose} title="Test Modal">
        Test content
      </Modal>
    )
    const modalContent = container.querySelector('.modal-content')
    expect(modalContent).toBeInTheDocument()
    
    fireEvent.click(modalContent!)
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('should stop propagation when modal content is clicked', () => {
    const { container } = render(
      <Modal isOpen onClose={mockOnClose} title="Test Modal">
        Test content
      </Modal>
    )
    const modalContent = container.querySelector('.modal-content')
    const overlay = container.querySelector('.modal-overlay')
    
    expect(modalContent).toBeInTheDocument()
    expect(overlay).toBeInTheDocument()
    
    // Create a mock event with stopPropagation
    const mockEvent = {
      stopPropagation: jest.fn(),
    }
    
    // Simulate click on content
    fireEvent.click(modalContent!, mockEvent)
    
    // Click on content should not trigger onClose
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('should render close button with correct text', () => {
    render(
      <Modal isOpen onClose={mockOnClose} title="Test Modal">
        Test content
      </Modal>
    )
    const closeButton = screen.getByRole('button')
    expect(closeButton).toHaveTextContent('✕')
  })
})
