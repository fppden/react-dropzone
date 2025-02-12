/* eslint react/prop-types: 0 */
import React, { createRef } from 'react'
import { cleanup, fireEvent, render } from 'react-testing-library'
import { renderHook } from 'react-hooks-testing-library'
import { fromEvent } from 'file-selector'
import * as utils from './utils'
import Dropzone, { useDropzone } from './index'

describe('useDropzone() hook', () => {
  let files
  let images

  beforeEach(() => {
    files = [createFile('file1.pdf', 1111, 'application/pdf')]
    images = [createFile('cats.gif', 1234, 'image/gif'), createFile('dogs.gif', 2345, 'image/jpeg')]
  })

  afterEach(cleanup)

  describe('behavior', () => {
    it('renders the root and input nodes with the necessary props', () => {
      const { container } = render(
        <Dropzone>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      expect(container.innerHTML).toMatchSnapshot()
    })

    it('sets {accept} prop on the <input>', () => {
      const accept = 'image/jpeg'
      const { container } = render(
        <Dropzone accept={accept}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      const input = container.querySelector('input')

      expect(input).toHaveAttribute('accept', accept)
    })

    it('updates {multiple} prop on the <input> when it changes', () => {
      const { container, rerender } = render(
        <Dropzone accept="image/jpeg">
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      expect(container.querySelector('input')).toHaveAttribute('accept', 'image/jpeg')

      rerender(
        <Dropzone accept="image/png">
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      expect(container.querySelector('input')).toHaveAttribute('accept', 'image/png')
    })

    it('sets {multiple} prop on the <input>', () => {
      const { container } = render(
        <Dropzone multiple>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      const input = container.querySelector('input')
      expect(input).toHaveAttribute('multiple')
    })

    it('updates {multiple} prop on the <input> when it changes', () => {
      const { container, rerender } = render(
        <Dropzone multiple={false}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      expect(container.querySelector('input')).not.toHaveAttribute('multiple')

      rerender(
        <Dropzone multiple>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      expect(container.querySelector('input')).toHaveAttribute('multiple')
    })

    it('sets any props passed to the input props getter on the <input>', () => {
      const name = 'dropzone-input'
      const { container } = render(
        <Dropzone multiple>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps({ name })} />
            </div>
          )}
        </Dropzone>
      )

      const input = container.querySelector('input')
      expect(input).toHaveAttribute('name', name)
    })

    it('sets any props passed to the root props getter on the root node', () => {
      const ariaLabel = 'Dropzone area'
      const { container } = render(
        <Dropzone multiple>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps({ 'aria-label': ariaLabel })}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      const dropzone = container.querySelector('div')

      expect(dropzone).toHaveAttribute('aria-label', ariaLabel)
    })

    it('runs the custom callback handlers provided to the root props getter', () => {
      const event = createDtWithFiles(files)

      const rootProps = {
        onClick: jest.fn(),
        onKeyDown: jest.fn(),
        onFocus: jest.fn(),
        onBlur: jest.fn(),
        onDragEnter: jest.fn(),
        onDragOver: jest.fn(),
        onDragLeave: jest.fn(),
        onDrop: jest.fn()
      }

      const ui = (
        <Dropzone>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps(rootProps)}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      const { container } = render(ui)

      const dropzone = container.querySelector('div')

      fireEvent.click(dropzone)
      expect(rootProps.onClick).toHaveBeenCalled()

      fireEvent.focus(dropzone)
      fireEvent.keyDown(dropzone)
      expect(rootProps.onFocus).toHaveBeenCalled()
      expect(rootProps.onKeyDown).toHaveBeenCalled()

      fireEvent.blur(dropzone)
      expect(rootProps.onBlur).toHaveBeenCalled()

      fireEvent.dragEnter(dropzone, event)
      expect(rootProps.onDragEnter).toHaveBeenCalled()

      fireEvent.dragOver(dropzone, event)
      expect(rootProps.onDragOver).toHaveBeenCalled()

      fireEvent.dragLeave(dropzone, event)
      expect(rootProps.onDragLeave).toHaveBeenCalled()

      fireEvent.drop(dropzone, event)
      expect(rootProps.onDrop).toHaveBeenCalled()
    })

    it('runs the custom callback handlers provided to the input props getter', () => {
      const inputProps = {
        onClick: jest.fn(),
        onChange: jest.fn()
      }

      const ui = (
        <Dropzone>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps(inputProps)} />
            </div>
          )}
        </Dropzone>
      )

      const { container } = render(ui)

      const input = container.querySelector('input')

      fireEvent.click(input)
      expect(inputProps.onClick).toHaveBeenCalled()

      fireEvent.change(input)
      expect(inputProps.onChange).toHaveBeenCalled()
    })

    it('runs no callback handlers if {disabled} is true', () => {
      const event = createDtWithFiles(files)

      const rootProps = {
        onClick: jest.fn(),
        onKeyDown: jest.fn(),
        onFocus: jest.fn(),
        onBlur: jest.fn(),
        onDragEnter: jest.fn(),
        onDragOver: jest.fn(),
        onDragLeave: jest.fn(),
        onDrop: jest.fn()
      }

      const inputProps = {
        onClick: jest.fn(),
        onChange: jest.fn()
      }

      const { container } = render(
        <Dropzone disabled>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps(rootProps)}>
              <input {...getInputProps(inputProps)} />
            </div>
          )}
        </Dropzone>
      )

      const dropzone = container.querySelector('div')

      fireEvent.click(dropzone)
      expect(rootProps.onClick).not.toHaveBeenCalled()

      fireEvent.focus(dropzone)
      fireEvent.keyDown(dropzone)
      expect(rootProps.onFocus).not.toHaveBeenCalled()
      expect(rootProps.onKeyDown).not.toHaveBeenCalled()

      fireEvent.blur(dropzone)
      expect(rootProps.onBlur).not.toHaveBeenCalled()

      fireEvent.dragEnter(dropzone, event)
      expect(rootProps.onDragEnter).not.toHaveBeenCalled()

      fireEvent.dragOver(dropzone, event)
      expect(rootProps.onDragOver).not.toHaveBeenCalled()

      fireEvent.dragLeave(dropzone, event)
      expect(rootProps.onDragLeave).not.toHaveBeenCalled()

      fireEvent.drop(dropzone, event)
      expect(rootProps.onDrop).not.toHaveBeenCalled()

      const input = container.querySelector('input')

      fireEvent.click(input)
      expect(inputProps.onClick).not.toHaveBeenCalled()

      fireEvent.change(input)
      expect(inputProps.onChange).not.toHaveBeenCalled()
    })

    test('{rootRef, inputRef} are exposed', () => {
      const { result } = renderHook(() => useDropzone())
      const { rootRef, inputRef, getRootProps, getInputProps } = result.current

      const { container } = render(
        <div {...getRootProps()}>
          <input {...getInputProps()} />
        </div>
      )

      expect(container.querySelector('div')).toEqual(rootRef.current)
      expect(container.querySelector('input')).toEqual(inputRef.current)
    })

    test('<Dropzone> exposes and sets the ref if using a ref object', () => {
      const dropzoneRef = createRef()
      const onClickSpy = jest.spyOn(HTMLInputElement.prototype, 'click')

      const { rerender } = render(
        <Dropzone ref={dropzoneRef}>
          {({ getRootProps, getInputProps, isFocused }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isFocused && <div id="focus" />}
            </div>
          )}
        </Dropzone>
      )

      expect(dropzoneRef.current).not.toBeNull()
      expect(typeof dropzoneRef.current.open).toEqual('function')

      dropzoneRef.current.open()

      expect(onClickSpy).toHaveBeenCalled()

      rerender(null)

      expect(dropzoneRef.current).toBeNull()
    })

    test('<Dropzone> exposes and sets the ref if using a ref fn', () => {
      let dropzoneRef
      const setRef = ref => (dropzoneRef = ref)
      const onClickSpy = jest.spyOn(HTMLInputElement.prototype, 'click')

      const { rerender } = render(
        <Dropzone ref={setRef}>
          {({ getRootProps, getInputProps, isFocused }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isFocused && <div id="focus" />}
            </div>
          )}
        </Dropzone>
      )

      expect(dropzoneRef).not.toBeNull()
      expect(typeof dropzoneRef.open).toEqual('function')

      dropzoneRef.open()

      expect(onClickSpy).toHaveBeenCalled()

      rerender(null)

      expect(dropzoneRef).toBeNull()
    })

    it('sets {isFocused} to false if {disabled} is true', () => {
      const { container, rerender } = render(
        <Dropzone>
          {({ getRootProps, getInputProps, isFocused }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isFocused && <div id="focus" />}
            </div>
          )}
        </Dropzone>
      )

      const dropzone = container.querySelector('div')

      fireEvent.focus(dropzone)
      expect(dropzone.querySelector('#focus')).not.toBeNull()

      rerender(
        <Dropzone disabled>
          {({ getRootProps, getInputProps, isFocused }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isFocused && <div id="focus" />}
            </div>
          )}
        </Dropzone>
      )

      expect(dropzone.querySelector('#focus')).toBeNull()
    })

    test('{tabindex} is 0 if {disabled} is false', () => {
      const { container } = render(
        <Dropzone>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      expect(container.querySelector('div')).toHaveAttribute('tabindex', '0')
    })

    test('{tabindex} is -1 if {disabled} is true', () => {
      const { container, rerender } = render(
        <Dropzone>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      expect(container.querySelector('div')).toHaveAttribute('tabindex', '0')

      rerender(
        <Dropzone disabled>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      expect(container.querySelector('div')).toHaveAttribute('tabindex', '-1')
    })

    test('refs are set when {refKey} is set to a different value', done => {
      const data = createDtWithFiles(files)

      class MyView extends React.Component {
        render() {
          const { children, innerRef, ...rest } = this.props
          return (
            <div id="dropzone" ref={innerRef} {...rest}>
              <div>{children}</div>
            </div>
          )
        }
      }

      const ui = (
        <Dropzone>
          {({ getRootProps }) => (
            <MyView {...getRootProps({ refKey: 'innerRef' })}>
              <span>Drop some files here ...</span>
            </MyView>
          )}
        </Dropzone>
      )

      const { container } = render(ui)
      const dropzone = container.querySelector('#dropzone')

      const fn = async () => {
        fireDrop(dropzone, data)
        await flushPromises(ui, container)
        done()
      }

      expect(fn).not.toThrow()
    })
  })

  describe('document drop protection', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')
    // Collect the list of addEventListener/removeEventListener spy calls into an object keyed by event name
    const collectEventListenerCalls = spy =>
      spy.mock.calls.reduce(
        (acc, [eventName, ...rest]) => ({
          ...acc,
          [eventName]: rest
        }),
        {}
      )

    it('installs hooks to prevent stray drops from taking over the browser window', () => {
      render(
        <Dropzone>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      expect(addEventListenerSpy).toHaveBeenCalledTimes(2)

      const addEventCalls = collectEventListenerCalls(addEventListenerSpy)
      const events = Object.keys(addEventCalls)

      expect(events).toContain('dragover')
      expect(events).toContain('drop')

      events.forEach(eventName => {
        const [fn, options] = addEventCalls[eventName]
        expect(fn).toBeDefined()
        expect(options).toBe(false)
      })
    })

    it('removes document hooks when unmounted', () => {
      const { unmount } = render(
        <Dropzone>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(2)

      const addEventCalls = collectEventListenerCalls(addEventListenerSpy)
      const removeEventCalls = collectEventListenerCalls(removeEventListenerSpy)
      const events = Object.keys(removeEventCalls)

      expect(events).toContain('dragover')
      expect(events).toContain('drop')

      events.forEach(eventName => {
        const [a] = addEventCalls[eventName]
        const [b] = removeEventCalls[eventName]
        expect(a).toEqual(b)
      })
    })

    it('terminates drags and drops on elements outside our dropzone', () => {
      render(
        <Dropzone>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      const dragEvt = new Event('dragover', { bubbles: true })
      const dragEvtPreventDefaultSpy = jest.spyOn(dragEvt, 'preventDefault')
      fireEvent(document.body, dragEvt)
      expect(dragEvtPreventDefaultSpy).toHaveBeenCalledTimes(1)

      const dropEvt = new Event('drop', { bubbles: true })
      const dropEvtPreventDefaultSpy = jest.spyOn(dropEvt, 'preventDefault')
      fireEvent(document.body, dropEvt)
      expect(dropEvtPreventDefaultSpy).toHaveBeenCalledTimes(1)
    })

    it('permits drags and drops on elements inside our dropzone', () => {
      const { container } = render(
        <Dropzone>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      const dropzone = container.querySelector('div')

      const dropEvt = new Event('drop', { bubbles: true })
      const dropEvtPreventDefaultSpy = jest.spyOn(dropEvt, 'preventDefault')

      fireEvent(dropzone, dropEvt)
      // A call is from the onDrop handler for the dropzone,
      // but there should be no more than 1
      expect(dropEvtPreventDefaultSpy).toHaveBeenCalledTimes(1)
    })

    it('does not prevent stray drops when {preventDropOnDocument} is false', () => {
      render(
        <Dropzone preventDropOnDocument={false}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      const dropEvt = new Event('drop', { bubbles: true })
      const dropEvtPreventDefaultSpy = jest.spyOn(dropEvt, 'preventDefault')
      fireEvent(document.body, dropEvt)
      expect(dropEvtPreventDefaultSpy).not.toHaveBeenCalledTimes(1)
    })
  })

  describe('event propagation', () => {
    const data = createDtWithFiles(files)

    test('drag events propagate from the inner dropzone to parents', async () => {
      const innerProps = {
        onDragEnter: jest.fn(),
        onDragOver: jest.fn(),
        onDragLeave: jest.fn(),
        onDrop: jest.fn()
      }

      const InnerDropzone = () => (
        <Dropzone {...innerProps}>
          {({ getRootProps, getInputProps }) => (
            <div id="inner-dropzone" {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      const parentProps = {
        onDragEnter: jest.fn(),
        onDragOver: jest.fn(),
        onDragLeave: jest.fn(),
        onDrop: jest.fn()
      }

      const ui = (
        <Dropzone {...parentProps}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <InnerDropzone />
            </div>
          )}
        </Dropzone>
      )

      const { container } = render(ui)

      const innerDropzone = container.querySelector('#inner-dropzone')

      fireDragEnter(innerDropzone, data)
      await flushPromises(ui, container)
      expect(innerProps.onDragEnter).toHaveBeenCalled()
      expect(parentProps.onDragEnter).toHaveBeenCalled()

      fireDragOver(innerDropzone, data)
      expect(innerProps.onDragOver).toHaveBeenCalled()
      expect(parentProps.onDragOver).toHaveBeenCalled()

      fireDragLeave(innerDropzone, data)
      expect(innerProps.onDragLeave).toHaveBeenCalled()
      expect(parentProps.onDragLeave).toHaveBeenCalled()

      fireDrop(innerDropzone, data)
      await flushPromises(ui, container)
      expect(innerProps.onDrop).toHaveBeenCalled()
      expect(parentProps.onDrop).toHaveBeenCalled()
    })

    test('drag events do not propagate from the inner dropzone to parent dropzone if user invoked stopPropagation() on the events', async () => {
      const innerProps = {
        onDragEnter: jest.fn(),
        onDragOver: jest.fn(),
        onDragLeave: jest.fn(),
        onDrop: jest.fn()
      }

      Object.keys(innerProps).forEach(prop =>
        innerProps[prop].mockImplementation((...args) => {
          const event = prop === 'onDrop' ? args.pop() : args.shift()
          event.stopPropagation()
        })
      )

      const InnerDropzone = () => (
        <Dropzone {...innerProps}>
          {({ getRootProps, getInputProps }) => (
            <div id="inner-dropzone" {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      const parentProps = {
        onDragEnter: jest.fn(),
        onDragOver: jest.fn(),
        onDragLeave: jest.fn(),
        onDrop: jest.fn()
      }

      const ui = (
        <Dropzone {...parentProps}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <InnerDropzone />
            </div>
          )}
        </Dropzone>
      )

      const { container } = render(ui)

      const innerDropzone = container.querySelector('#inner-dropzone')

      fireDragEnter(innerDropzone, data)
      await flushPromises(ui, container)
      expect(innerProps.onDragEnter).toHaveBeenCalled()
      expect(parentProps.onDragEnter).not.toHaveBeenCalled()

      fireDragOver(innerDropzone, data)
      expect(innerProps.onDragOver).toHaveBeenCalled()
      expect(parentProps.onDragOver).not.toHaveBeenCalled()

      fireDragLeave(innerDropzone, data)
      expect(innerProps.onDragLeave).toHaveBeenCalled()
      expect(parentProps.onDragLeave).not.toHaveBeenCalled()

      fireDrop(innerDropzone, data)
      await flushPromises(ui, container)
      expect(innerProps.onDrop).toHaveBeenCalled()
      expect(parentProps.onDrop).not.toHaveBeenCalled()
    })

    test('onDragLeave is not invoked for the parent dropzone if it was invoked for an inner dropzone', async () => {
      const innerDragLeave = jest.fn()
      const InnerDropzone = () => (
        <Dropzone onDragLeave={innerDragLeave}>
          {({ getRootProps, getInputProps }) => (
            <div id="inner-dropzone" {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      const parentDragLeave = jest.fn()
      const ui = (
        <Dropzone onDragLeave={parentDragLeave}>
          {({ getRootProps, getInputProps }) => (
            <div id="parent-dropzone" {...getRootProps()}>
              <input {...getInputProps()} />
              <InnerDropzone />
            </div>
          )}
        </Dropzone>
      )

      const { container } = render(ui)

      const parentDropzone = container.querySelector('#parent-dropzone')

      fireDragEnter(parentDropzone, data)
      await flushPromises(ui, container)

      const innerDropzone = container.querySelector('#inner-dropzone')
      fireDragEnter(innerDropzone, data)
      await flushPromises(ui, container)

      fireDragLeave(innerDropzone, data)
      expect(innerDragLeave).toHaveBeenCalled()
      expect(parentDragLeave).not.toHaveBeenCalled()
    })
  })

  describe('plugin integration', () => {
    it('uses provided getFilesFromEvent()', async () => {
      const data = createDtWithFiles(files)

      const props = {
        getFilesFromEvent: jest.fn().mockImplementation(event => fromEvent(event)),
        onDragEnter: jest.fn(),
        onDragOver: jest.fn(),
        onDragLeave: jest.fn(),
        onDrop: jest.fn()
      }

      const ui = (
        <Dropzone {...props}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      fireDragEnter(dropzone, data)
      await flushPromises(ui, container)
      expect(props.onDragEnter).toHaveBeenCalled()

      fireDragOver(dropzone, data)
      expect(props.onDragOver).toHaveBeenCalled()

      fireDragLeave(dropzone, data)
      expect(props.onDragLeave).toHaveBeenCalled()

      fireDrop(dropzone, data)
      await flushPromises(ui, container)
      expect(props.onDrop).toHaveBeenCalled()

      expect(props.getFilesFromEvent).toHaveBeenCalledTimes(2)
    })
  })

  describe('onFocus', () => {
    it('sets focus state', () => {
      const { container } = render(
        <Dropzone>
          {({ getRootProps, getInputProps, isFocused }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isFocused && <div id="focus" />}
            </div>
          )}
        </Dropzone>
      )

      const dropzone = container.querySelector('div')

      fireEvent.focus(dropzone)
      expect(dropzone.querySelector('#focus')).not.toBeNull()
    })

    it('does not set focus state if user stopped event propagation', () => {
      const { container } = render(
        <Dropzone>
          {({ getRootProps, getInputProps, isFocused }) => (
            <div {...getRootProps({ onFocus: event => event.stopPropagation() })}>
              <input {...getInputProps()} />
              {isFocused && <div id="focus" />}
            </div>
          )}
        </Dropzone>
      )

      const dropzone = container.querySelector('div')

      fireEvent.focus(dropzone)
      expect(dropzone.querySelector('#focus')).toBeNull()
    })
  })

  describe('onBlur', () => {
    it('unsets focus state', () => {
      const { container } = render(
        <Dropzone>
          {({ getRootProps, getInputProps, isFocused }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isFocused && <div id="focus" />}
            </div>
          )}
        </Dropzone>
      )

      const dropzone = container.querySelector('div')

      fireEvent.focus(dropzone)
      expect(dropzone.querySelector('#focus')).not.toBeNull()

      fireEvent.blur(dropzone)
      expect(dropzone.querySelector('#focus')).toBeNull()
    })

    it('does not unset focus state if user stopped event propagation', () => {
      const { container } = render(
        <Dropzone>
          {({ getRootProps, getInputProps, isFocused }) => (
            <div {...getRootProps({ onBlur: event => event.stopPropagation() })}>
              <input {...getInputProps()} />
              {isFocused && <div id="focus" />}
            </div>
          )}
        </Dropzone>
      )

      const dropzone = container.querySelector('div')

      fireEvent.focus(dropzone)
      expect(dropzone.querySelector('#focus')).not.toBeNull()
      fireEvent.blur(dropzone)
      expect(dropzone.querySelector('#focus')).not.toBeNull()
    })
  })

  describe('onClick', () => {
    it('should proxy the click event to the input', () => {
      const activeRef = createRef()
      const active = <span ref={activeRef}>I am active</span>
      const onClickSpy = jest.spyOn(HTMLInputElement.prototype, 'click')

      const { container } = render(
        <Dropzone>
          {({ getRootProps, getInputProps, isFileDialogActive }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isFileDialogActive && active}
            </div>
          )}
        </Dropzone>
      )

      const dropzone = container.querySelector('div')

      fireEvent.click(dropzone)
      const ref = activeRef.current
      expect(ref).not.toBeNull()
      expect(dropzone).toContainElement(ref)
      expect(onClickSpy).toHaveBeenCalled()
    })

    it('should not not proxy the click event to the input if event propagation was stopped', () => {
      const onClickSpy = jest.spyOn(HTMLInputElement.prototype, 'click')
      const { container } = render(
        <Dropzone>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps({ onClick: event => event.stopPropagation() })}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      const dropzone = container.querySelector('div')

      fireEvent.click(dropzone)
      expect(onClickSpy).not.toHaveBeenCalled()
    })

    it('should schedule input click on next tick in Edge', () => {
      jest.useFakeTimers()

      const isIeOrEdgeSpy = jest.spyOn(utils, 'isIeOrEdge').mockReturnValueOnce(true)
      const onClickSpy = jest.spyOn(HTMLInputElement.prototype, 'click')

      const { container } = render(
        <Dropzone>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      const dropzone = container.querySelector('div')

      fireEvent.click(dropzone)
      jest.runAllTimers()

      expect(onClickSpy).toHaveBeenCalled()
      jest.useRealTimers()
      isIeOrEdgeSpy.mockClear()
    })
  })

  describe('onKeyDown', () => {
    it('triggers the click event on the input if the SPACE/ENTER keys are pressed', () => {
      const activeRef = createRef()
      const active = <span ref={activeRef}>I am active</span>
      const onClickSpy = jest.spyOn(HTMLInputElement.prototype, 'click')
      const { container } = render(
        <Dropzone>
          {({ getRootProps, getInputProps, isFileDialogActive }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isFileDialogActive && active}
            </div>
          )}
        </Dropzone>
      )

      const dropzone = container.querySelector('div')

      fireEvent.keyDown(dropzone, {
        keyCode: 32
      })

      fireEvent.keyDown(dropzone, {
        keyCode: 13
      })

      const ref = activeRef.current
      expect(ref).not.toBeNull()
      expect(dropzone).toContainElement(ref)
      expect(onClickSpy).toHaveBeenCalledTimes(2)
    })

    it('does not trigger the click event on the input if the dropzone is not in focus', () => {
      const onClickSpy = jest.spyOn(HTMLInputElement.prototype, 'click')
      const { container } = render(
        <Dropzone>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      const input = container.querySelector('input')

      fireEvent.keyDown(input, {
        keyCode: 32
      })

      expect(onClickSpy).not.toHaveBeenCalled()
    })

    it('does not trigger the click event on the input if event propagation was stopped', () => {
      const onClickSpy = jest.spyOn(HTMLInputElement.prototype, 'click')
      const { container } = render(
        <Dropzone>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps({ onKeyDown: event => event.stopPropagation() })}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      const dropzone = container.querySelector('div')

      fireEvent.keyDown(dropzone, {
        keyCode: 32
      })
      expect(onClickSpy).not.toHaveBeenCalled()
    })

    it('does not trigger the click event on the input for other keys', () => {
      const onClickSpy = jest.spyOn(HTMLInputElement.prototype, 'click')
      const { container } = render(
        <Dropzone>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      const dropzone = container.querySelector('div')

      fireEvent.keyDown(dropzone, {
        keyCode: 97
      })
      expect(onClickSpy).not.toHaveBeenCalled()
    })
  })

  describe('onDrag*', () => {
    it('invokes callbacks for the appropriate events', async () => {
      const data = createDtWithFiles(files)

      const props = {
        onDragEnter: jest.fn(),
        onDragOver: jest.fn(),
        onDragLeave: jest.fn(),
        onDrop: jest.fn()
      }

      const ui = (
        <Dropzone {...props}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      fireDragEnter(dropzone, data)
      await flushPromises(ui, container)
      expect(props.onDragEnter).toHaveBeenCalled()

      fireDragOver(dropzone, data)
      expect(props.onDragOver).toHaveBeenCalled()

      fireDragLeave(dropzone, data)
      expect(props.onDragLeave).toHaveBeenCalled()

      fireDrop(dropzone, data)
      await flushPromises(ui, container)
      expect(props.onDrop).toHaveBeenCalled()
    })

    it('invokes callbacks for the appropriate events even if it cannot access the data', async () => {
      const emptyData = createDtWithFiles([])

      const props = {
        onDragEnter: jest.fn(),
        onDragOver: jest.fn(),
        onDragLeave: jest.fn(),
        onDrop: jest.fn(),
        onDropAccepted: jest.fn(),
        onDropRejected: jest.fn()
      }

      const ui = (
        <Dropzone {...props}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      fireDragEnter(dropzone, emptyData)
      await flushPromises(ui, container)
      expect(props.onDragEnter).toHaveBeenCalled()

      fireDragOver(dropzone, emptyData)
      expect(props.onDragOver).toHaveBeenCalled()

      fireDragLeave(dropzone, emptyData)
      expect(props.onDragLeave).toHaveBeenCalled()

      const data = createDtWithFiles(files)
      fireDrop(dropzone, data)
      await flushPromises(ui, container)
      expect(props.onDrop).toHaveBeenCalled()
      expect(props.onDropAccepted).toHaveBeenCalledWith(files, expect.any(Object))
      expect(props.onDropRejected).not.toHaveBeenCalled()
    })

    it('does not invoke callbacks if no files are detected', async () => {
      const data = {
        dataTransfer: {
          items: [],
          types: ['text/html', 'text/plain']
        }
      }

      const props = {
        onDragEnter: jest.fn(),
        onDragOver: jest.fn(),
        onDragLeave: jest.fn(),
        onDrop: jest.fn(),
        onDropAccepted: jest.fn(),
        onDropRejected: jest.fn()
      }

      const ui = (
        <Dropzone {...props}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      fireDragEnter(dropzone, data)
      await flushPromises(ui, container)
      expect(props.onDragEnter).not.toHaveBeenCalled()

      fireDragOver(dropzone, data)
      expect(props.onDragOver).not.toHaveBeenCalled()

      fireDragLeave(dropzone, data)
      expect(props.onDragLeave).not.toHaveBeenCalled()

      fireDrop(dropzone, data)
      await flushPromises(ui, container)
      expect(props.onDrop).not.toHaveBeenCalled()
      expect(props.onDropAccepted).not.toHaveBeenCalled()
      expect(props.onDropRejected).not.toHaveBeenCalled()
    })

    it('sets {isDragActive} and {isDragAccept} if some files are accepted on dragented', async () => {
      const ui = (
        <Dropzone>
          {({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isDragActive && 'dragActive'}
              {isDragAccept && 'dragAccept'}
              {isDragReject && 'dragReject'}
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      const data = createDtWithFiles(files)
      fireDragEnter(dropzone, data)
      await flushPromises(ui, container)

      expect(dropzone).toHaveTextContent('dragActive')
      expect(dropzone).toHaveTextContent('dragAccept')
      expect(dropzone).not.toHaveTextContent('dragReject')
    })

    it('sets {isDragActive} and {isDragReject} of some files are not accepted on dragenter', async () => {
      const ui = (
        <Dropzone accept="image/*">
          {({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isDragActive && 'dragActive'}
              {isDragAccept && 'dragAccept'}
              {isDragReject && 'dragReject'}
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      const data = createDtWithFiles([...files, ...images])
      fireDragEnter(dropzone, data)
      await flushPromises(ui, container)

      expect(dropzone).toHaveTextContent('dragActive')
      expect(dropzone).not.toHaveTextContent('dragAccept')
      expect(dropzone).toHaveTextContent('dragReject')
    })

    it('sets {isDragActive, isDragAccept, isDragReject} if all files are accepted and {multiple} is false on dragenter', async () => {
      const ui = (
        <Dropzone accept="image/*" multiple={false}>
          {({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isDragActive && 'dragActive'}
              {isDragAccept && 'dragAccept'}
              {isDragReject && 'dragReject'}
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      const data = createDtWithFiles(images)
      fireDragEnter(dropzone, data)
      await flushPromises(ui, container)

      expect(dropzone).toHaveTextContent('dragActive')
      expect(dropzone).toHaveTextContent('dragAccept')
      expect(dropzone).toHaveTextContent('dragReject')
    })

    it('keeps {isDragActive} if dragleave is triggered for some arbitrary node', async () => {
      const { container: overlayContainer } = render(<div />)
      const ui = (
        <Dropzone>
          {({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isDragActive && 'dragActive'}
              {isDragAccept && 'dragAccept'}
              {isDragReject && 'dragReject'}
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      const data = createDtWithFiles(files)
      fireDragEnter(dropzone, data)
      await flushPromises(ui, container)

      const event = new Event('dragleave', { bubbles: true })
      Object.defineProperty(event, 'target', {
        value: overlayContainer.querySelector('div'),
        writable: false
      })
      fireEvent(dropzone, event)

      expect(dropzone).toHaveTextContent('dragActive')
    })

    it('updates {isDragActive} if {accept} changes mid-drag', async () => {
      const ui = (
        <Dropzone accept="image/*">
          {({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isDragActive && 'dragActive'}
              {isDragAccept && 'dragAccept'}
              {isDragReject && 'dragReject'}
            </div>
          )}
        </Dropzone>
      )
      const { container, rerender } = render(ui)
      const dropzone = container.querySelector('div')

      const data = createDtWithFiles(images)
      fireDragEnter(dropzone, data)
      await flushPromises(ui, container)

      expect(dropzone).toHaveTextContent('dragActive')
      expect(dropzone).toHaveTextContent('dragAccept')
      expect(dropzone).not.toHaveTextContent('dragReject')

      rerender(
        <Dropzone accept="text/*">
          {({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isDragActive && 'dragActive'}
              {isDragAccept && 'dragAccept'}
              {isDragReject && 'dragReject'}
            </div>
          )}
        </Dropzone>
      )

      expect(dropzone).toHaveTextContent('dragActive')
      expect(dropzone).not.toHaveTextContent('dragAccept')
      expect(dropzone).toHaveTextContent('dragReject')
    })

    it('resets {isDragActive, isDragAccept, isDragReject} on dragleave', async () => {
      const ui = (
        <Dropzone accept="image/*">
          {({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isDragActive && 'dragActive'}
              {isDragAccept && 'dragAccept'}
              {isDragReject && 'dragReject'}
              {!isDragActive && (
                <span id="child" data-accept={isDragAccept} data-reject={isDragReject} />
              )}
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      const data = createDtWithFiles(images)

      fireDragEnter(container.querySelector('#child'), data)
      fireDragEnter(dropzone, data)
      await flushPromises(ui, container)
      fireDragEnter(dropzone, data)
      await flushPromises(ui, container)

      expect(dropzone).toHaveTextContent('dragActive')
      expect(dropzone).toHaveTextContent('dragAccept')
      expect(dropzone).not.toHaveTextContent('dragReject')

      fireDragLeave(dropzone, data)
      await flushPromises(ui, container)
      expect(dropzone).not.toHaveTextContent('dragActive')
      expect(dropzone).not.toHaveTextContent('dragAccept')
      expect(dropzone).not.toHaveTextContent('dragReject')

      const child = container.querySelector('#child')
      expect(child).toHaveAttribute('data-accept', 'false')
      expect(child).toHaveAttribute('data-reject', 'false')
    })
  })

  describe('onDrop', () => {
    test('callback is invoked when <input> change event occurs', async () => {
      const onDropSpy = jest.fn()

      const ui = (
        <Dropzone onDrop={onDropSpy}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const input = container.querySelector('input')

      Object.defineProperty(input, 'files', { value: files })

      dispatchEvt(input, 'change')
      await flushPromises(ui, container)

      expect(onDropSpy).toHaveBeenCalledWith(files, [], expect.anything())
    })

    it('sets {acceptedFiles, rejectedFiles}', async () => {
      const FileList = (props = { files: [] }) => (
        <ul>
          {props.files.map(file => (
            <li key={file.name} data-type={props.type}>
              {file.name}
            </li>
          ))}
        </ul>
      )

      const getAcceptedFiles = node => node.querySelectorAll(`[data-type="accepted"]`)
      const getRejectedFiles = node => node.querySelectorAll(`[data-type="rejected"]`)
      const matchToFiles = (fileList, files) =>
        Array.from(fileList).every(item => !!files.find(file => file.name === item.textContent))

      const ui = (
        <Dropzone accept="image/*">
          {({ getRootProps, getInputProps, acceptedFiles, rejectedFiles }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <FileList files={acceptedFiles} type="accepted" />
              <FileList files={rejectedFiles} type="rejected" />
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      fireDrop(dropzone, createDtWithFiles(images))
      await flushPromises(ui, container)
      const acceptedFileList = getAcceptedFiles(dropzone)
      expect(acceptedFileList).toHaveLength(images.length)
      expect(matchToFiles(acceptedFileList, images)).toBe(true)

      fireDrop(dropzone, createDtWithFiles(files))
      await flushPromises(ui, container)
      const rejectedFileList = getRejectedFiles(dropzone)
      expect(rejectedFileList).toHaveLength(files.length)
      expect(matchToFiles(rejectedFileList, files)).toBe(true)
    })

    it('resets {isDragActive, isDragAccept, isDragReject}', async () => {
      const ui = (
        <Dropzone>
          {({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isDragActive && 'dragActive'}
              {isDragAccept && 'dragAccept'}
              {isDragReject && 'dragReject'}
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      const data = createDtWithFiles(files)

      fireDragEnter(dropzone, data)
      await flushPromises(ui, container)

      expect(dropzone).toHaveTextContent('dragActive')
      expect(dropzone).toHaveTextContent('dragAccept')
      expect(dropzone).not.toHaveTextContent('dragReject')

      fireDrop(dropzone, data)
      await flushPromises(ui, container)
      expect(dropzone).not.toHaveTextContent('dragActive')
      expect(dropzone).not.toHaveTextContent('dragAccept')
      expect(dropzone).not.toHaveTextContent('dragReject')
    })

    it('rejects all files if {multiple} is false and {accept} criteria is not met', async () => {
      const onDropSpy = jest.fn()
      const ui = (
        <Dropzone accept="image/*" onDrop={onDropSpy} multiple={false}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      fireDrop(dropzone, createDtWithFiles(files))
      await flushPromises(ui, container)
      expect(onDropSpy).toHaveBeenCalledWith([], files, expect.anything())
    })

    it('rejects all files if {multiple} is false and {accept} criteria is met', async () => {
      const onDropSpy = jest.fn()
      const ui = (
        <Dropzone accept="image/*" onDrop={onDropSpy} multiple={false}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      fireDrop(dropzone, createDtWithFiles(images))
      await flushPromises(ui, container)
      expect(onDropSpy).toHaveBeenCalledWith([], images, expect.anything())
    })

    it('accepts a single files if {multiple} is false and {accept} criteria is met', async () => {
      const onDropSpy = jest.fn()
      const ui = (
        <Dropzone accept="image/*" onDrop={onDropSpy} multiple={false}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      const [image] = images
      fireDrop(dropzone, createDtWithFiles([image]))
      await flushPromises(ui, container)
      expect(onDropSpy).toHaveBeenCalledWith([image], [], expect.anything())
    })

    it('accepts all files if {multiple} is true', async () => {
      const onDropSpy = jest.fn()
      const ui = (
        <Dropzone onDrop={onDropSpy}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      fireDrop(dropzone, createDtWithFiles(files))
      await flushPromises(ui, container)
      expect(onDropSpy).toHaveBeenCalledWith(files, [], expect.anything())
    })

    it('resets {isFileDialogActive} state', async () => {
      const onDropSpy = jest.fn()
      const activeRef = createRef()
      const active = <span ref={activeRef}>I am active</span>

      const ui = (
        <Dropzone onDrop={onDropSpy}>
          {({ getRootProps, getInputProps, isFileDialogActive, open }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isFileDialogActive && active}
              <button type="button" onClick={open}>
                Open
              </button>
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')
      const btn = container.querySelector('button')

      btn.click()

      const ref = activeRef.current
      expect(dropzone).toContainElement(ref)

      fireDrop(dropzone, createDtWithFiles(files))
      await flushPromises(ui, container)

      expect(dropzone).not.toContainElement(ref)
    })

    it('gets invoked with both accepted/rejected files', async () => {
      const onDropSpy = jest.fn()
      const ui = (
        <Dropzone accept="image/*" onDrop={onDropSpy}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      fireDrop(dropzone, createDtWithFiles(files))
      await flushPromises(ui, container)
      expect(onDropSpy).toHaveBeenCalledWith([], files, expect.anything())
      onDropSpy.mockClear()

      fireDrop(dropzone, createDtWithFiles(images))
      await flushPromises(ui, container)
      expect(onDropSpy).toHaveBeenCalledWith(images, [], expect.anything())
      onDropSpy.mockClear()

      fireDrop(dropzone, createDtWithFiles([...files, ...images]))
      await flushPromises(ui, container)
      expect(onDropSpy).toHaveBeenCalledWith(images, files, expect.anything())
    })

    test('onDropAccepted callback is invoked if some files are accepted', async () => {
      const onDropAcceptedSpy = jest.fn()
      const ui = (
        <Dropzone accept="image/*" onDropAccepted={onDropAcceptedSpy}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      fireDrop(dropzone, createDtWithFiles(files))
      await flushPromises(ui, container)
      expect(onDropAcceptedSpy).not.toHaveBeenCalled()
      onDropAcceptedSpy.mockClear()

      fireDrop(dropzone, createDtWithFiles(images))
      await flushPromises(ui, container)
      expect(onDropAcceptedSpy).toHaveBeenCalledWith(images, expect.anything())
      onDropAcceptedSpy.mockClear()

      fireDrop(dropzone, createDtWithFiles([...files, ...images]))
      await flushPromises(ui, container)
      expect(onDropAcceptedSpy).toHaveBeenCalledWith(images, expect.anything())
    })

    test('onDropRejected callback is invoked if some files are rejected', async () => {
      const onDropRejectedSpy = jest.fn()
      const ui = (
        <Dropzone accept="image/*" onDropRejected={onDropRejectedSpy}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      fireDrop(dropzone, createDtWithFiles(files))
      await flushPromises(ui, container)
      expect(onDropRejectedSpy).toHaveBeenCalledWith(files, expect.anything())
      onDropRejectedSpy.mockClear()

      fireDrop(dropzone, createDtWithFiles(images))
      await flushPromises(ui, container)
      expect(onDropRejectedSpy).not.toHaveBeenCalled()
      onDropRejectedSpy.mockClear()

      fireDrop(dropzone, createDtWithFiles([...files, ...images]))
      await flushPromises(ui, container)
      expect(onDropRejectedSpy).toHaveBeenCalledWith(files, expect.anything())
    })

    it('accepts a dropped image when Firefox provides a bogus file type', async () => {
      const onDropSpy = jest.fn()
      const ui = (
        <Dropzone accept="image/*" onDrop={onDropSpy}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      const images = [createFile('bogus.gif', 1234, 'application/x-moz-file')]
      fireDrop(dropzone, createDtWithFiles(images))
      await flushPromises(ui, container)

      expect(onDropSpy).toHaveBeenCalledWith(images, [], expect.anything())
    })

    it('filters files according to {maxSize}', async () => {
      const onDropSpy = jest.fn()
      const ui = (
        <Dropzone onDrop={onDropSpy} maxSize={1111}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      fireDrop(dropzone, createDtWithFiles(images))
      await flushPromises(ui, container)

      expect(onDropSpy).toHaveBeenCalledWith([], images, expect.anything())
    })

    it('filters files according to {minSize}', async () => {
      const onDropSpy = jest.fn()
      const ui = (
        <Dropzone onDrop={onDropSpy} minSize={1112}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )
      const { container } = render(ui)
      const dropzone = container.querySelector('div')

      fireDrop(dropzone, createDtWithFiles(files))
      await flushPromises(ui, container)

      expect(onDropSpy).toHaveBeenCalledWith([], files, expect.anything())
    })
  })

  describe('onFileDialogCancel', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('is not invoked every time window receives focus', () => {
      const onFileDialogCancelSpy = jest.fn()

      render(
        <Dropzone onFileDialogCancel={onFileDialogCancelSpy}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
      )

      dispatchEvt(document.body, 'focus')
      jest.runAllTimers()

      expect(onFileDialogCancelSpy).not.toHaveBeenCalled()
    })

    it('resets {isFileDialogActive}', () => {
      const activeRef = createRef()
      const active = <span ref={activeRef}>I am active</span>
      const onFileDialogCancelSpy = jest.fn()

      const { container } = render(
        <Dropzone onFileDialogCancel={onFileDialogCancelSpy}>
          {({ getRootProps, getInputProps, isFileDialogActive, open }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isFileDialogActive && active}
              <button type="button" onClick={open}>
                Open
              </button>
            </div>
          )}
        </Dropzone>
      )

      const dropzone = container.querySelector('div')
      const btn = container.querySelector('button')

      btn.click()
      jest.runAllTimers()
      const ref = activeRef.current
      expect(ref).not.toBeNull()
      expect(dropzone).toContainElement(ref)

      dispatchEvt(document.body, 'focus')
      jest.runAllTimers()

      expect(onFileDialogCancelSpy).toHaveBeenCalled()
      expect(dropzone).not.toContainElement(ref)
    })

    it('is not invoked if <input> is not rendered', () => {
      const onFileDialogCancelSpy = jest.fn()
      const { container, rerender } = render(
        <Dropzone onFileDialogCancel={onFileDialogCancelSpy}>
          {({ getRootProps, getInputProps, open }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <button type="button" onClick={open}>
                Open
              </button>
            </div>
          )}
        </Dropzone>
      )

      const btn = container.querySelector('button')
      btn.click()
      jest.runAllTimers()

      rerender(
        <Dropzone onFileDialogCancel={onFileDialogCancelSpy}>
          {({ getRootProps }) => <div {...getRootProps()} />}
        </Dropzone>
      )
      jest.runAllTimers()

      dispatchEvt(document.body, 'focus')
      jest.runAllTimers()

      expect(onFileDialogCancelSpy).not.toHaveBeenCalled()
    })

    it('is not invoked if files were selected', () => {
      const onFileDialogCancelSpy = jest.fn()

      const { container } = render(
        <Dropzone onFileDialogCancel={onFileDialogCancelSpy}>
          {({ getRootProps, getInputProps, open }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <button type="button" onClick={open}>
                Open
              </button>
            </div>
          )}
        </Dropzone>
      )

      const input = container.querySelector('input')
      Object.defineProperty(input, 'files', { value: files })

      const btn = container.querySelector('button')
      btn.click()
      jest.runAllTimers()

      dispatchEvt(document.body, 'focus')
      jest.runAllTimers()

      expect(onFileDialogCancelSpy).not.toHaveBeenCalled()
    })

    it('does not throw if callback is not provided', () => {
      const { container } = render(
        <Dropzone onFileDialogCancel={null}>
          {({ getRootProps, getInputProps, open }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <button type="button" onClick={open}>
                Open
              </button>
            </div>
          )}
        </Dropzone>
      )

      const btn = container.querySelector('button')
      btn.click()
      jest.runAllTimers()

      const fn = () => {
        dispatchEvt(document.body, 'focus')
        jest.runAllTimers()
      }
      expect(fn).not.toThrow()
    })
  })

  describe('{open}', () => {
    it('can open file dialog programmatically', () => {
      const onClickSpy = jest.spyOn(HTMLInputElement.prototype, 'click')
      const { container } = render(
        <Dropzone>
          {({ getRootProps, getInputProps, open }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <button type="button" onClick={open}>
                Open
              </button>
            </div>
          )}
        </Dropzone>
      )

      const btn = container.querySelector('button')

      btn.click()

      expect(onClickSpy).toHaveBeenCalled()
    })

    it('sets {isFileDialogActive} state', () => {
      const activeRef = createRef()
      const active = <span ref={activeRef}>I am active</span>
      const { container } = render(
        <Dropzone>
          {({ getRootProps, getInputProps, isFileDialogActive, open }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {isFileDialogActive && active}
              <button type="button" onClick={open}>
                Open
              </button>
            </div>
          )}
        </Dropzone>
      )

      const dropzone = container.querySelector('div')
      const btn = container.querySelector('button')

      btn.click()

      const ref = activeRef.current
      expect(ref).not.toBeNull()
      expect(dropzone).toContainElement(ref)
    })

    it('does nothing if {disabled} is true', () => {
      const onClickSpy = jest.spyOn(HTMLInputElement.prototype, 'click')
      const { container } = render(
        <Dropzone disabled>
          {({ getRootProps, getInputProps, open }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <button type="button" onClick={open}>
                Open
              </button>
            </div>
          )}
        </Dropzone>
      )

      const btn = container.querySelector('button')

      btn.click()

      expect(onClickSpy).not.toHaveBeenCalled()
    })

    it('does not throw if <input> is missing', () => {
      const { container } = render(
        <Dropzone>
          {({ getRootProps, open }) => (
            <div {...getRootProps()}>
              <button type="button" onClick={open}>
                Open
              </button>
            </div>
          )}
        </Dropzone>
      )

      const btn = container.querySelector('button')

      const fn = () => btn.click()
      expect(fn).not.toThrow()
    })
  })
})

function flushPromises(ui, container) {
  return new Promise(resolve =>
    global.setImmediate(() => {
      render(ui, { container })
      resolve(container)
    })
  )
}

function createDtWithFiles(files = []) {
  return {
    dataTransfer: {
      files,
      items: files.map(file => ({
        kind: 'file',
        type: file.type,
        getAsFile: () => file
      })),
      types: ['Files']
    }
  }
}

function fireDragEnter(node, data) {
  dispatchEvt(node, 'dragenter', data)
}

function fireDragOver(node, data) {
  dispatchEvt(node, 'dragover', data)
}

function fireDragLeave(node, data) {
  dispatchEvt(node, 'dragleave', data)
}

function fireDrop(node, data) {
  dispatchEvt(node, 'drop', data)
}

// Using fireEvent.* doesn't work for our use case,
// we cannot set the event props
function dispatchEvt(node, type, data) {
  const event = new Event(type, { bubbles: true })
  if (data) {
    Object.assign(event, data)
  }
  fireEvent(node, event)
}

function createFile(name, size, type) {
  const file = new File([], name, { type })
  Object.defineProperty(file, 'size', {
    get() {
      return size
    }
  })
  return file
}
