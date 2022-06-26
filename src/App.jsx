import {useState, useRef, useReducer, useEffect} from 'react'
import './App.css'

function App() {
  const imgRef = useRef()
  const imageLoadRef = useRef()
  const imageZonRef = useRef()
  const [imageZonNode, setImageZonNode] = useState({})
  const canvas = useRef()
  const [degre, setDegre] = useState(3)
  const [isSmall, setIsSmall] = useState(false)
  const [capStyle, setCapstyle] = useReducer((o, n) => ({...o, ...n}), {
    width: 230,
    height: 80,
    top: 240,
    left: 70,
  })

  const {width: capw, height: caph, top: capt, left: capl} = capStyle

  const imageLoad = e => {
    imageLoadRef.current = {
      natw: e.target.naturalWidth,
      nath: e.target.naturalHeight,
    }
    console.log(e.target.naturalHeight, e.target.naturalWidth)
    if (e.target.naturalWidth < 500 && e.target.naturalHeight < 500) {
      console.log('issmall')
      setIsSmall(true)
    }
  }
  useEffect(() => {
    if (imageZonRef.current) {
      setImageZonNode(imageZonRef.current.getBoundingClientRect())
    }
  }, [])

  useEffect(() => {
    if (!imageZonNode || !imageLoadRef.current) return
    const {natw, nath} = imageLoadRef.current
    const ctx = canvas.current.getContext('2d')
    ctx.save()
    ctx.clearRect(0, 0, capw, caph)
    const wratio = imageZonNode.width / natw
    const hratio = imageZonNode.height / nath
    let ratio = hratio > wratio ? wratio : hratio
    ratio = ratio > 1 ? 1 : ratio // 1代表圖片寬高都小於給定的外框，故不需縮放
    const degree = ((degre + 1) % 4) * 90

    if (degree !== 0) {
      ctx.translate(capw / 2, caph / 2)
      ctx.rotate(-degree * (Math.PI / 180))
    }

    switch (degree) {
      case 0:
        ctx.drawImage(
          imgRef.current,
          (capl - (imageZonNode.width - natw * ratio) / 2) / ratio,
          (capt - (imageZonNode.height - nath * ratio) / 2) / ratio,
          capw / ratio,
          caph / ratio,
          0,
          0,
          capw,
          caph,
        )
        break
      case 90:
        ctx.drawImage(
          imgRef.current,
          (imageZonNode.height -
            capt -
            caph -
            (imageZonNode.height - natw * ratio) / 2) /
            ratio,
          (capl - (imageZonNode.width - nath * ratio) / 2) / ratio,
          caph / ratio,
          capw / ratio,
          -(caph / 2),
          -(capw / 2),
          caph,
          capw,
        )
        break
      case 180:
        ctx.drawImage(
          imgRef.current,
          (imageZonNode.width -
            capl -
            capw -
            (imageZonNode.width - natw * ratio) / 2) /
            ratio,
          (imageZonNode.height -
            capt -
            caph -
            (imageZonNode.height - nath * ratio) / 2) /
            ratio,
          capw / ratio,
          caph / ratio,
          -(capw / 2),
          -(caph / 2),
          capw,
          caph,
        )
        break
      default: // 270
        ctx.drawImage(
          imgRef.current,
          (capt - (imageZonNode.height - natw * ratio) / 2) / ratio,
          (imageZonNode.width -
            capl -
            capw -
            (imageZonNode.width - nath * ratio) / 2) /
            ratio,
          caph / ratio,
          capw / ratio,
          -(caph / 2),
          -(capw / 2),
          caph,
          capw,
        )
        break
    }
    ctx.restore()
  }, [capl, capt, capw, caph, degre])

  function handleRotate() {
    setDegre(pre => pre + 1)
  }
  const imgStyle = isSmall
    ? {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) rotate(-${
          ((degre + 1) % 4) * 90
        }deg)`,
      }
    : {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        transform: `rotate(-${((degre + 1) % 4) * 90}deg)`,
      }
  return (
    <div className="App">
      <button onClick={handleRotate}>rotate</button>
      <div ref={imageZonRef} className="imageZone">
        <Crop
          capw={capw}
          caph={caph}
          capt={capt}
          capl={capl}
          imageZon={imageZonNode}
          setCapstyle={setCapstyle}
        />
        <img
          alt=""
          ref={imgRef}
          onLoad={imageLoad}
          style={imgStyle}
          // https://8.share.photo.xuite.net/newcloth1130/18cacec/19188888/1068578388_l.jpg
          // https://cdn2.ettoday.net/images/1359/d1359276.jpg
          // https://buzzorange.com/techorange/app/uploads/2021/07/18829005700_f7428e86da_h.jpg
          // https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTwGAoas5TfnpTGY2x_9dX2YVpj1QcP1T3_Q&usqp=CAU
          src="https://buzzorange.com/techorange/app/uploads/2021/07/18829005700_f7428e86da_h.jpg"
        />
      </div>
      <canvas
        ref={canvas}
        width={capw}
        height={caph}
        style={{
          border: '1px solid black',
        }}
      ></canvas>
    </div>
  )
}

function Crop({capw, caph, capt, capl, setCapstyle, imageZon}) {
  const currentPos = useRef()
  function mouseMove(e) {
    let capLeft = e.clientX - imageZon.left - currentPos.current.left
    let capTop = e.clientY - imageZon.top - currentPos.current.top
    let rightBound = imageZon.width - capw
    let bottomBound = imageZon.height - caph
    if (capLeft < imageZon.left) {
      capLeft = 0
    }
    if (capTop <= 0) {
      capTop = 0
    }
    if (capLeft >= rightBound) {
      capLeft = imageZon.width - capw
    }
    if (capTop >= bottomBound) {
      capTop = imageZon.height - caph
    }
    setCapstyle({
      left: capLeft,
      top: capTop,
    })
  }
  function mouseDown(e) {
    currentPos.current = {
      left: e.clientX - imageZon.left - capl,
      top: e.clientY - imageZon.top - capt,
    }
    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('mouseup', mouseUp)
  }

  function mouseUp() {
    window.removeEventListener('mousemove', mouseMove)
    window.removeEventListener('mouseup', mouseUp)
  }
  return (
    <div
      style={{
        width: capw,
        height: caph,
        top: capt,
        left: capl,
      }}
      className="crop"
      onMouseDown={mouseDown}
    ></div>
  )
}

export default App
