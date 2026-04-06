import React, { useEffect, useState } from 'react'
import { activatePreset, createPreset, deletePreset, getPresets, updatePreset } from '../../api/managerApi'
import styles from './ThresholdPreset.module.css'
import PageTitle from '../../components/common/PageTitle'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Input from '../../components/common/Input'

// 폼 초기값
const EMPTY_FORM = {
  name: '',
  tempLow: '',
  tempHigh: '',
  humLow: '',
  humHigh: '',
  airPpmLow: '',
  airPpmBad: '',
  luxLow: '',
  luxHigh: '',
}

const ThresholdPreset = () => {
  const [presets, setPresets] = useState([])
  // 수정 중인 프리셋 id (null 이면 신규 추가 모드)
  const [editingId, setEditingId] = useState(null)
  // 폼 표시 여부
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  // 프리셋 목록 불러오기
  const fetchPresets = async () => {
    let data = await getPresets()
    if (data) setPresets(data)
  }
  
  useEffect(() => {
    fetchPresets()
  }, [])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  // 추가 버튼 클릭 -> 빈 폼 표시
  const handleAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  // 수정 버튼 클릭 -> 해당 프리셋 값으로 폼 채우기
  const handleEdit = (preset) => {
    setEditingId(preset.id)
    setForm({
      name: preset.name,
      tempLow: preset.tempLow,
      tempHigh: preset.tempHigh,
      humLow: preset.humLow,
      humHigh: preset.humHigh,
      airPpmLow: preset.airPpmLow,
      airPpmBad: preset.airPpmBad,
      luxLow: preset.luxLow,
      luxHigh: preset.luxHigh,
    })
    setShowForm(true)
  }

  // 저장 (추가 or 수정)
  const handleSubmit = async() => {
    if (editingId !== null) {
      await updatePreset(editingId, form)
    } else {
      await createPreset(form)
    }
    setShowForm(false)
    setForm(EMPTY_FORM)
    setEditingId(null)
    fetchPresets()
  }

  // 삭제
  const handleDelete = async (id) => {
    await deletePreset(id)
    fetchPresets()
  }

  // 활성화
  const handleActivate = async (id) => {
    await activatePreset(id)
    fetchPresets()
  }

  const headers = [[
    { label: '프리셋 이름', rowSpan: 2, style: { verticalAlign: 'middle' } },
    { label: '온도 (℃)', colSpan: 2 },
    { label: '습도 (%)', colSpan: 2 },
    { label: '대기질 (ppm)', colSpan: 2 },
    { label: '조도 (lux)', colSpan: 2 },
    { label: '상태', rowSpan: 2, style: { width: '80px', verticalAlign: 'middle' } },
    { label: '관리', rowSpan: 2, style: { verticalAlign: 'middle' } },
  ],[
    { label: '하한' }, { label: '상한' },
    { label: '하한' }, { label: '상한' },
    { label: '하한' }, { label: '상한' },
    { label: '하한' }, { label: '상한' },
  ]]
  
  return (
    <div className={styles.container}>
      <PageTitle title='임계값 프리셋' />

      <div className={styles.addRow}>
        <Button onClick={handleAdd} variant='primary'>+ 프리셋 추가</Button>
      </div>

      {/* 프리셋 목록 테이블 */}
      <Table 
        headers={headers}
        data={presets}
        renderRow={(preset) => (
          <>
            <td>{preset.name}</td>
            <td>{preset.tempLow}</td>
            <td>{preset.tempHigh}</td>
            <td>{preset.humLow}</td>
            <td>{preset.humHigh}</td>
            <td>{preset.airPpmLow}</td>
            <td>{preset.airPpmBad}</td>
            <td>{preset.luxLow}</td>
            <td>{preset.luxHigh}</td>
            <td>
              <span className={`${styles.badge} ${preset.active ? styles.badgeActive : styles.badgeInactive}`}>
                {preset.active ? '적용중' : '미적용'}
              </span>
            </td>
            <td>
              <div className={styles.actions}>
                <Button
                  size='small'
                  variant='primary'
                  onClick={() => handleActivate(preset.id)}
                  disabled={preset.active}
                >
                  적용
                </Button>
                <Button
                  size='small'
                  onClick={() => handleEdit(preset)}
                >
                  수정
                </Button>
                <Button
                  size='small'
                  variant='danger'
                  onClick={() => handleDelete(preset.id)}
                  disabled={preset.active}
                >
                  삭제
                </Button>
              </div>
            </td>
          </>
        )}
      />

      {/* 추가/수정 폼 */}
      {showForm && (
        <div className={styles.form}>
          <h2 className={styles.formTitle}>{editingId !== null ? '프리셋 수정' : '프리셋 추가'}</h2>
          <div className={styles.formGrid}>
            <Input label='프리셋 이름' labelStyle={{ color: '#000000' }} name='name' value={form.name} onChange={handleChange} />
            <Input label='온도 하한 (℃)' labelStyle={{ color: '#000000' }} name='tempLow' type='number' value={form.tempLow} onChange={handleChange} />
            <Input label='온도 상한 (℃)' labelStyle={{ color: '#000000' }} name='tempHigh' type='number' value={form.tempHigh} onChange={handleChange} />
            <Input label='습도 하한 (%)' labelStyle={{ color: '#000000' }} name='humLow' type='number' value={form.humLow} onChange={handleChange} />
            <Input label='습도 상한 (%)' labelStyle={{ color: '#000000' }} name='humHigh' type='number' value={form.humHigh} onChange={handleChange} />
            <Input label='대기질 하한 (ppm)' labelStyle={{ color: '#000000' }} name='airPpmLow' type='number' value={form.airPpmLow} onChange={handleChange} />
            <Input label='대기질 상한 (ppm)' labelStyle={{ color: '#000000' }} name='airPpmBad' type='number' value={form.airPpmBad} onChange={handleChange} />
            <Input label='조도 하한 (lux)' labelStyle={{ color: '#000000' }} name='luxLow' type='number' value={form.luxLow} onChange={handleChange} />
            <Input label='조도 상한 (lux)' labelStyle={{ color: '#000000' }} name='luxHigh' type='number' value={form.luxHigh} onChange={handleChange} />
          </div>
          <div className={styles.formButtons}>
            <Button onClick={handleSubmit} variant='primary'>저장</Button>
            <Button onClick={() => setShowForm(false)} variant='dart'>취소</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThresholdPreset