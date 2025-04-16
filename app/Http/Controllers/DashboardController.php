<?php

namespace App\Http\Controllers;

use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Tasks by status
        $totalPendingTasks = Task::where('status', 'pending')->count();
        $myPendingTasks = Task::where('status', 'pending')->where('assigned_user_id', $user->id)->count();

        $totalProgressTasks = Task::where('status', 'in_progress')->count();
        $myProgressTasks = Task::where('status', 'in_progress')->where('assigned_user_id', $user->id)->count();

        $totalCompletedTasks = Task::where('status', 'completed')->count();
        $myCompletedTasks = Task::where('status', 'completed')->where('assigned_user_id', $user->id)->count();

        // Active tasks
        $activeTasks = Task::whereIn('status', ['pending', 'in_progress'])
            ->where('assigned_user_id', $user->id)
            ->limit(10)
            ->get();
        $activeTasks = TaskResource::collection($activeTasks);

        // Completion rate
        $allTasks = Task::count();
        $completionRate = $allTasks > 0 ? round(($totalCompletedTasks / $allTasks) * 100, 2) : 0;

        // User productivity (completed tasks this month)
        $userProductivity = User::withCount([
            'tasks as completed_tasks_count' => function ($query) {
                $query->where('status', 'completed')
                    ->where('updated_at', '>=', Carbon::now()->startOfMonth());
            }
        ])->get()->map(function ($user) {
            return [
                'name' => $user->name,
                'completed' => $user->completed_tasks_count,
            ];
        });

        // Overdue tasks grouped by user
        $overdueTasks = Task::where('status', '!=', 'completed')
            ->whereDate('due_date', '<', now())
            ->with('assignedUser')
            ->get()
            ->groupBy('assigned_user_id')
            ->map(function ($tasks, $userId) {
                return [
                    'user' => $tasks->first()->assignedUser->name ?? 'Unassigned',
                    'overdue' => $tasks->count()
                ];
            })->values();

        return inertia('Dashboard', compact(
            'totalPendingTasks',
            'myPendingTasks',
            'totalProgressTasks',
            'myProgressTasks',
            'totalCompletedTasks',
            'myCompletedTasks',
            'activeTasks',
            'completionRate',
            'userProductivity',
            'overdueTasks'
        ));
    }
}
