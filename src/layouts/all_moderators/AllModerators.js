import React, { useEffect, useState } from 'react'
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import axios from 'axios';
import { GET_ALL_USERS } from 'constants/crud';
import ModeratorsTable from './сomponents/ModersTable';
import EditModeratorModal from './сomponents/EditModal';

function AllModerators() {
    const [moderators, setModerators] = useState([])
    const [editingModerator, setEditingModerator] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    useEffect(()=>{
        const token = localStorage.getItem("authToken")
        axios.get(GET_ALL_USERS, {
            headers: {
                Authorization: `Token ${token}`
            }
        }).then(res=>{
            console.log(res)
            setModerators(res.data)
        }).catch(err=>{
            console.log(err)
        })
    }, [])


      const handleEdit = (moderator) => {
            setEditingModerator(moderator);
            setIsModalOpen(true);
        };

     const handleSave = async (updatedData) => {
        try {
            // Отправляем PATCH запрос на бэкенд
            const token = localStorage.getItem("authToken")
            await axios.put(`${GET_ALL_USERS}${editingModerator.id}/edit/`, updatedData, {
            headers: {
                'Authorization': `Token ${token}` // если требуется авторизация
            }
            }).then(res=>{
                console.log(res)
            }).catch(err=>{
                console.log(err)
            });
            
            // Обновляем состояние только после успешного ответа от сервера
            setModerators(moderators.map(moderator => 
            moderator.id === editingModerator.id 
                ? { ...moderator, ...updatedData } 
                : moderator
            ));
            
            // Закрываем модалку
            setIsModalOpen(false);
        } catch (error) {
            console.error('Ошибка при обновлении модератора:', error);
            // Можно добавить уведомление об ошибке
        }
        };

    const handleDelete = (moderatorId) => {
        if (window.confirm('Вы уверены, что хотите удалить этого модератора?')) {
        setModerators(moderators.filter(m => m.id !== moderatorId));
        console.log('Удалить модератора с ID:', moderatorId);
        const token = localStorage.getItem("authToken")

        axios.delete(`${GET_ALL_USERS}${moderatorId}/delete/`, {
            headers: {
                Authorization: `Token ${token}`
            }
        }).then(res=>{
            console.log(res.data)
        }).catch(err=>{
            console.log(err)
        })
        }
    };



    return (
            <DashboardLayout>
                Все модераторы

                <ModeratorsTable 
                    moderators={moderators} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                />
                 <EditModeratorModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    moderator={editingModerator}
                    onSave={handleSave}
                />
            </DashboardLayout>
    )
}

export default AllModerators