import express from 'express'
import { query, q } from '../db'
import { checkAuth } from '../middleware/checkAuth'
import { CONTESTS, makeBracket, runContest } from '../arena/contests'

const router = express.Router()

router.get('/contests', checkAuth, (req, res) => {
  res.json(CONTESTS)
})

router.get('/matches', checkAuth, (req: any, res) => {
  query(
    'SELECT t.*, a.name as a_name, b.name as b_name FROM tbl_tournament_match t JOIN tbl_monster a ON a.id = t.monster_a_id JOIN tbl_monster b ON b.id = t.monster_b_id ORDER BY t.scheduled_at',
    (err: any, rows: any) => {
      if (err) return res.status(500).send('oops')
      res.json(rows)
    }
  )
})

router.post('/bracket', checkAuth, async (req: any, res) => {
  if (req.user.role !== 'STAFF' && req.user.role !== 'ADMIN') return res.status(403).send('no')
  const { monster_ids, contest, start } = req.body
  if (!monster_ids || monster_ids.length < 2) return res.status(400).json({ error: 'need 2+ monsters' })
  const pairs = makeBracket(monster_ids)
  let when = new Date(start || Date.now())
  for (const [a, b] of pairs) {
    await q('INSERT INTO tbl_tournament_match (monster_a_id, monster_b_id, contest, scheduled_at) VALUES (?,?,?,?)', [a, b, contest || 'ROAR', when])
    when = new Date(when.getTime() + 30 * 60 * 1000)
  }
  res.json({ matches: pairs.length })
})

router.post('/matches/:id/run', checkAuth, async (req: any, res) => {
  const rows = await q('SELECT * FROM tbl_tournament_match WHERE id = ?', [req.params.id])
  const match = rows[0]
  if (!match) return res.status(404).send('no match')
  if (match.winner_id) return res.status(400).json({ error: 'already done' })
  const a = (await q('SELECT * FROM tbl_monster WHERE id = ?', [match.monster_a_id]))[0]
  const b = (await q('SELECT * FROM tbl_monster WHERE id = ?', [match.monster_b_id]))[0]
  const result = runContest(match.contest, a, b)
  await q('UPDATE tbl_tournament_match SET winner_id = ?, score_a = ?, score_b = ? WHERE id = ?', [result.winner, result.scoreA, result.scoreB, match.id])
  res.json(result)
})

router.get('/leaderboard', checkAuth, async (req: any, res) => {
  const rows = await q(
    'SELECT m.id, m.name, m.species, COUNT(t.id) as wins FROM tbl_monster m JOIN tbl_tournament_match t ON t.winner_id = m.id GROUP BY m.id ORDER BY wins DESC LIMIT 20'
  )
  res.json(rows)
})

export default router
