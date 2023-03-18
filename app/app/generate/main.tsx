"use client"
import { Grade } from '@/components/grade'
import { Options } from '@/components/options'
import { SubjectChoice } from '@/components/subject'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { mataPelajaran } from '@/lib/mapel'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { Slider } from '@/components/ui/slider'
import { Session } from 'next-auth'
import toast from 'react-hot-toast'
import LoadingItemQuestion from '@/components/loading-item-question'
import { Boxes, Sidebar, SidebarClose, SidebarOpen } from 'lucide-react'
import ItemQuestion from '@/components/item-question'


interface Props {
    session: Session | null
}

const MainPage = ({ session }: Props) => {
    const router = useRouter()
    const [subject, setSubject] = useState<string>("");
    const [grade, setGrade] = useState<string>("umum");
    const [haveOptions, setHaveOptions] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [topic, setTopic] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [total, setTotal] = useState(0)
    const [isInitial, setIsInitial] = useState(true)

    const soalRef = useRef<null | HTMLDivElement>(null);

    const scrollToBios = () => {
        if (soalRef.current !== null) {
            soalRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };


    const onSubmit = async () => {
        if (!session?.user) {
            router.push("/api/auth/signin")
            return;
        }

        if (total === 0) {
            return;
        }

        if (subject === "") {
            toast("Pilih mata pelajaran terlebih dahulu", { position: 'bottom-center' })
            return;
        }
        setIsInitial(false)
        
        await generate();
    }

    const reset = () => {
        setQuestions([])
    }

    const generate = async () => {
        setIsLoading(true)
        reset()

        const response = await fetch("/api/request-question-trial", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                subject: subject,
                grade: grade,
                have_options: haveOptions,
                topic: topic,
                total: total,
            }),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        // This data is a ReadableStream
        const data = response.body;

        if (!data) {
            return;
        }
        const decoder = new TextDecoder();
        const reader = data.getReader();
        let buffer = ""
        let done = false;

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);

            buffer += chunkValue;
        }

        try {
            const questions = JSON.parse(buffer);
            setQuestions(questions);
        } catch (error) {
            console.log(error);
        }

        setIsLoading(false)
        scrollToBios();
        addQuestionTotal()
    };

    const addQuestionTotal = async (total = 5) => {
        await fetch("/api/counter?total=" + total)
    }

    return (
        <div className='flex w-full flex-col gap-8 lg:flex-row lg:gap-4'>
            <div className='flex h-auto w-3/12 flex-col'>
                <form className="flex w-full flex-col gap-2 rounded-lg">
                    <h1 className='mb-4 inline-flex w-full items-center justify-between border-b border-zinc-50 text-lg font-bold'><span>Filter Generate</span></h1>
                    <div className='flex flex-col gap-2'>
                        <Label htmlFor="message-2">Mata Pelajaran / Subject</Label>
                        <SubjectChoice disabled={isLoading} onChange={(value) => setSubject(value)} value={subject} />
                    </div>
                    <motion.div
                        className='flex flex-col gap-2'>
                        <Label className='mt-4'>Topik Terkait</Label>
                        <Textarea onChange={(e) => setTopic(e.target.value)} value={topic} disabled={isLoading} placeholder={`Seperti : ${!subject ? "materi pelajaran, kata kunci, dll." : mataPelajaran.find((v) => v.nama === subject)?.subTopik}`} />
                        <span className='text-xs text-zinc-500'>Kamu bisa memasukkan lebih dari satu topik.</span>
                    </motion.div>
                    <motion.div
                        className='flex w-full flex-col justify-between gap-4 sm:flex-row sm:gap-2'>
                        <div className='mt-4 flex w-full flex-col gap-2 sm:w-1/2'>
                            <Label>Tingkatan / Kelas</Label>
                            <Grade disabled={isLoading} onChange={setGrade} value={grade} />
                        </div>
                        <div className='mt-4 flex w-full flex-col gap-2 sm:w-1/2'>
                            <Label>Pilihan Jawaban</Label>
                            <Options disabled={isLoading} onChange={setHaveOptions} haveOptions={haveOptions} />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: subject ? 1 : 0, height: subject ? "auto" : 0, display: subject ? "flex" : "none" }}
                        className='flex w-full flex-col justify-between gap-4 sm:flex-row sm:gap-2'>

                        <div className='mt-4 flex w-full flex-col gap-2'>
                            <Label>Jumlah Soal <span className='text-lg font-bold'>--{total}--</span></Label>
                            <Slider disabled={isLoading} defaultValue={[0]} max={20} step={5} onValueChange={(e) => setTotal(e[0])} value={[total]} />
                        </div>
                    </motion.div>
                    <Button
                        className='mt-4 h-14 bg-emerald-500 text-lg hover:bg-emerald-400'
                        size={"lg"}
                        disabled={isLoading}
                        onClick={onSubmit}
                        type="button">
                        {isLoading ? "Sedang Mencari..." : "Generate Soal"}
                    </Button>
                </form>
            </div>
            <div className='flex min-h-screen w-9/12 flex-col gap-4 border-l border-zinc-100 pl-8'>
                {/* Recommendation */}

                {isInitial &&
                    <div className='grid grid-cols-3 gap-8 self-center'>
                        <span className='cursor-pointer rounded-lg border p-4 text-sm hover:bg-zinc-100' onClick={() => { setSubject('Matematika'); setTopic('Pecahan'); setGrade('SD Kelas 5'); setTotal(5) }}><span className='font-bold'>Matematika</span>: Pecahan untuk kelas 5 SD</span>
                        <span className='cursor-pointer rounded-lg border p-4 text-sm hover:bg-zinc-100' onClick={() => { setSubject('Bahasa Inggris'); setTopic('Expression'); setGrade('SMP Kelas 3'); setTotal(5) }}><span className='font-bold'>Bahasa Inggris</span>: Expression untuk kelas 3 SMP</span>
                        <span className='cursor-pointer rounded-lg border p-4 text-sm hover:bg-zinc-100' onClick={() => { setSubject('IPA'); setTopic('Sistem Pencernaan'); setGrade('SMA Kelas 1'); setTotal(5) }}><span className='font-bold'>IPA</span>: Sistem Pencernaan untuk kelas 1 SMA</span>
                    </div>
                }
                {isLoading && [0, 1, 2, 3].map((item) => (<LoadingItemQuestion  key={item} />))}
                {questions.map((question, index) => {
                    return (
                        <ItemQuestion key={index} index={index + 1} question={question} />
                    )
                })}
            </div>
        </div>
    )
}

export default MainPage